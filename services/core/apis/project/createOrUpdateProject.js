import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer, badRequest, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { main } from "../../neo4j-handler/index";
import cryptoRandomString from 'crypto-random-string';
import moment from "moment";
export const createOrUpdateProject = async(event) => {
    try{
      devLogger("createOrUpdateProject", event, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su']
      };
      let auth= await accessAllowed(authQuery);
      if( auth.access !=="allowed"){
        return auth;
      }
      if(event.body.projectId){
        if(!event.body.updatedAt && !event.body.updatedBy){
          let updateObj = Object.assign(event.body, {'updatedAt': moment().format(), 'updatedBy': auth.userEmail});
          let result = await projectModel.findOneAndUpdate(
            { projectId: { $eq: event.body.projectId },
              isActive: true,
            },
            updateObj,
            {
              upsert: false
            }
          );
          if(result){
            await main({
              actionType: 'createOrUpdateProjectNeo4j',
              node: {
                'id': event.body.projectId,
                'name': event.body.name ? event.body.name : result.name,
                'description': event.body.description ? event.body.description : result.description,
                'createdAt': event.body.createdAt ? event.body.createdAt : result.createdAt,
                'createdBy': event.body.createdBy ? event.body.createdBy : result.createdBy,
                'updatedAt': moment().format(),
                'updatedBy': auth.userEmail
              }
            });
            return successResponse('Project Updated Successfully');
          } else{
            return failResponse('No info found to updated', 404);
          }
        } else {
          return badRequest("updatedAt or updatedBy fields are not allowed in request body");
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = {
          name: event.body.name,
          description: event.body.description,
          projectId: 'P_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
          isActive: true,
          createdAt: moment().format(),
          createdBy: auth.userEmail,
          updatedAt: "",
          updatedBy: ""
        };
        await main({
          actionType: 'createOrUpdateProjectNeo4j',
          node: {
            'id': docToInsert.projectId,
            'name': event.body.name,
            'description': event.body.description,
            'isActive': true,
            'createdAt': moment().format(),
            'createdBy': auth.userEmail,
            'updatedAt': "",
            'updatedBy': ""
          }
        });
        await projectModel.create(docToInsert);
        return successResponse('Project Added Successfully', docToInsert);
      }
    } catch(err) {
      errorLogger("createOrUpdateProject", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};