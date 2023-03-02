import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { internalServer, successResponse, badRequest, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
import { teamModel } from "../../../utilities/dbModels/team";
import { projectModel } from "../../../utilities/dbModels/project";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
export const createOrUpdateView = async(event) => {
    try{
      devLogger("createOrUpdateView", event, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su']
      };
      let auth= await accessAllowed(authQuery);
      if( !auth.success){
        return auth;
      }
      if(event.body.viewId){
        // if(event.body.type == null || event.body.name == null || event.body.relationName == null || event.body.rootId == null){
        //   return badRequest("Body parameters cannot be null");
        // }
        if(!event.body.updatedAt && !event.body.updatedBy){
          let updateObj = Object.assign(event.body, {'updatedAt': new Date().toISOString(), 'updatedBy': auth.userEmail});
          let result = await viewModel.findOneAndUpdate(
            {
              viewId: event.body.viewId
            },
            updateObj,
            {
              upsert: false
            }
          );
          if(result){
            return successResponse('View Updated Successfully');
          } else{
            return failResponse('No info found to updated', 404);
          }
        } else {
          return badRequest("updatedAt or updatedBy fields are not allowed in request body");
        }
      } else if(!event.body.type || !event.body.name || !event.body.relationName || !event.body.rootId){
        return badRequest("Missing body parameters");
      } else {
        const sourceViews = await viewModel.find();
        const doc = sourceViews.filter((el) => {
          return el.relationName.toLowerCase()===event.body.relationName.toLowerCase();
        });
        if(doc.length >= 1){
          return badRequest(`Invalid view name or relation name in body parameters. Only unique view name or relation name are allowed.`);
        }
        if(generateRegex('Employee').test(event.body.type)){
          const emp =  await employeeMasterModel.find({ 'EmployeeCode': { '$regex': event.body.rootId, '$options': 'i' } });
          if(emp.length < 1){
            return internalServer('Invalid rootId');
          }
        } else if(generateRegex('Project').test(event.body.type)){
          const emp =  await projectModel.find({ 'projectId': { '$regex': event.body.rootId, '$options': 'i' } });
          if(emp.length < 1){
            return internalServer('Invalid rootId');
          }
        } else {
          const emp =  await teamModel.find({ 'teamId': { '$regex': event.body.rootId, '$options': 'i' } });
          if(emp.length < 1){
            return internalServer('Invalid rootId');
          }
        }
        const docToInsert = {
          name: event.body.name.toLowerCase(),
          type: event.body.type,
          rootId: event.body.rootId,
          relationName: event.body.relationName,
          viewId: 'V_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: auth.userEmail,
          updatedAt: "",
          updatedBy: ""
        };
        await viewModel.create(docToInsert);
        return successResponse('View Added Successfully', docToInsert);
      }
    } catch(err) {
      errorLogger("createOrUpdateView", err, "Error db call");
      return internalServer(`Invalid Body Parameters`);
    }
};
function generateRegex(str) {
  return new RegExp(`${str}`,"i");
}