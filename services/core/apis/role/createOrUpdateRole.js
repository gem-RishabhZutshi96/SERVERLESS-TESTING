import { makeDBConnection } from "../../../utilities/db/mongo";
import { roleMasterModel } from "../../../utilities/dbModels/roleMaster";
import { internalServer, badRequest, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
export const createOrUpdateRole = async(event) => {
    try{
      devLogger("createOrUpdateRole", event, "event");
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
      if(event.body.roleId){
        let result = await roleMasterModel.findOneAndUpdate(
          {
            roleId: event.body.roleId
          },
          event.body,
          {
            upsert: false
          }
        );
        if(result){
            return successResponse('Role Updated Successfully');
        } else{
            return failResponse('No info found to updated');
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = { 
          name: event.body.name,
          description: event.body.description,
          roleId: 'R_'.concat(cryptoRandomString({length: 6, type: 'base64'})),
        };
        await roleMasterModel.create(docToInsert);
        return successResponse('Role Added Successfully');
      }
    } catch(err) {
      errorLogger("createOrUpdateRole", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};