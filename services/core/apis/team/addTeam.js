import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, badRequest, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
export const addTeam = async(event) => {
    try{
      devLogger("addTeam", event, "event");
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
      if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = { 
          name: event.body.name,
          description: event.body.description,
          teamId: 'T_'.concat(cryptoRandomString({length: 6, type: 'base64'})),
        };
        await teamModel.create(docToInsert);
        return successResponse('Team Added Successfully');
      }
    } catch(err) {
      errorLogger("addTeam", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};