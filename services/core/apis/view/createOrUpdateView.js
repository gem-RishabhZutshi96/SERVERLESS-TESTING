import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { internalServer, successResponse, badRequest, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
import { parameterStore } from "../../../utilities/config/commonData";
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
      if(auth!=="allowed"){
        return auth;
      }
      if(event.body.viewId){
        let result = await viewModel.findOneAndUpdate(
          {
            viewId: event.body.viewId
          },
          event.body,
          {
            upsert: false
          }
        );
        if(result){
            return successResponse('View Updated Successfully');
        } else{
            return failResponse('No info found to updated', 404);
        }
      } else if(!(event.body.name || event.body.relationName)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const sourceRelations = Object.entries(parameterStore[process.env.stage].sourceViews).filter(([key, value]) => generateRegex(value.relation).test(event.body.relationName));
        if(sourceRelations.length >= 1){
          const docToInsert = {
            name: event.body.name,
            relationName: sourceRelations[0][1].relation,
            viewId: 'V_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
          };
          await viewModel.create(docToInsert);
          return successResponse('View Added Successfully', docToInsert);
        } else {
          return badRequest("Invalid Body Parameters");
        }
      }
    } catch(err) {
      errorLogger("createOrUpdateView", err, "Error db call");
      return internalServer(`Invalid Body Parameters`);
    }
};
function generateRegex(str) {
  return new RegExp(`${str}`,"i");
}