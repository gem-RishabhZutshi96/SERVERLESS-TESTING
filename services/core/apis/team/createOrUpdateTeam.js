import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, badRequest, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import cryptoRandomString from 'crypto-random-string';
import { main } from "../../neo4j-handler/index";
import moment from "moment";
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
      if( auth.access !=="allowed"){
        return auth;
      }
      if(event.body.teamId){
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
          await main({
            actionType: 'createOrUpdateTeamNeo4j',
            node: {
              'id': event.body.teamId,
              'name': event.body.name ? event.body.name : result.name,
              'description': event.body.description ? event.body.description : result.description,
              'createdAt': event.body.createdAt ? event.body.createdAt : result.createdAt,
              'createdBy': event.body.createdBy ? event.body.createdBy : result.createdBy,
              'updatedAt': moment().format(),
              'updatedBy': auth.userEmail
            }
          });
          return successResponse('Team Updated Successfully');
        } else{
            return failResponse('No info found to updated', 404);
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = {
          name: event.body.name,
          description: event.body.description,
          teamId: 'T_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
          isActive: true,
          createdAt: moment().format(),
          createdBy: auth.userEmail,
          updatedAt: "",
          updatedBy: ""
        };
        await main({
          actionType: 'createOrUpdateTeamNeo4j',
          node: {
            'id': docToInsert.teamId,
            'name': event.body.name,
            'description': event.body.description,
            'isActive': true,
            'createdAt': moment().format(),
            'createdBy': auth.userEmail,
            'updatedAt': "",
            'updatedBy': ""
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