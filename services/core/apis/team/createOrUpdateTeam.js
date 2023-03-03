import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, badRequest, failResponse } from "../../../utilities/response/index";
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
      if( !auth.success){
        return auth;
      }
      if(event.body.teamId){
        if(!event.body.updatedAt && !event.body.updatedBy){
          let updateObj = Object.assign(event.body, {'updatedAt': new Date().toISOString(), 'updatedBy': auth.data[0].userEmail});
          let result = await teamModel.findOneAndUpdate(
            {
              teamId: event.body.teamId
            },
            updateObj,
            {
              upsert: false
            }
          );
          if(!result){
            return failResponse('No info found to updated', 404);
          } else {
            const neo4jDBQueryResp = await main({
              actionType: 'createOrUpdateTeamNeo4j',
              node: {
                'id': event.body.teamId,
                'name': event.body.name ? event.body.name : result.name,
                'description': event.body.description ? event.body.description : result.description,
                'updatedAt': new Date().toISOString(),
                'updatedBy': auth.data[0].userEmail
              }
            });
            return neo4jDBQueryResp;
          }
        } else {
          return badRequest("updatedAt or updatedBy fields are not allowed in request body");
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("Missing body parameters");
      } else {
        const docToInsert = {
          name: event.body.name,
          description: event.body.description,
          teamId: 'T_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: auth.data[0].userEmail,
          updatedAt: "",
          updatedBy: ""
        };
        const neo4jDBQueryResp = await main({
          actionType: 'createOrUpdateTeamNeo4j',
          node: {
            'id': docToInsert.teamId,
            'name': event.body.name,
            'description': event.body.description,
            'isActive': true,
            'createdAt': new Date().toISOString(),
            'createdBy': auth.data[0].userEmail,
            'updatedAt': "",
            'updatedBy': ""
          }
        });
        await teamModel.create(docToInsert);
        return neo4jDBQueryResp;
      }
    } catch(err) {
      errorLogger("createOrUpdateTeam", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};