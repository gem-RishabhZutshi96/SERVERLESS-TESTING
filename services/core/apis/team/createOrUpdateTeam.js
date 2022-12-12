import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, badRequest, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
import { main } from "../../neo4j-handler/index";
export const createOrUpdateTeam = async(event) => {
    try{
      devLogger("createOrUpdateTeam", event, "event");
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
      if(event.body.teamId){
        await main({
          actionType: 'createOrUpdateTeamNeo4j',
          node: {
            'id': event.body.teamId,
            'name': event.body.name,
            'description': event.body.description
          }
        });
        let result = await teamModel.findOneAndUpdate(
          {
              teamId: event.body.teamId
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
          teamId: 'T_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
        };
        await main({
          actionType: 'createOrUpdateTeamNeo4j',
          node: {
            'id': docToInsert.teamId,
            'name': event.body.name,
            'description': event.body.description
          }
        });
        await teamModel.create(docToInsert);
        return successResponse('Team Added Successfully', docToInsert);
      }
    } catch(err) {
      errorLogger("createOrUpdateTeam", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};