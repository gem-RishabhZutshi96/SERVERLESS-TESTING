import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { internalServer, successResponse, badRequest, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
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
            return successResponse('Team Updated Successfully');
        } else{
            return failResponse('No info found to updated');
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = { 
          name: event.body.name,
          description: event.body.description,
          roleId: 'V_'.concat(cryptoRandomString({length: 6, type: 'base64'})),
        };
        await viewModel.create(docToInsert);
        return successResponse('View Added Successfully');
      }
    } catch(err) {
      errorLogger("createOrUpdateView", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};