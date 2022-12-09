import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { main } from "../../neo4j-handler/index";
export const deleteTeam = async(event) => {
    try{
      devLogger("deleteTeam", event, "event");
      let userToken =null;
      let neo4jUpdate;
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
      const teamId = event.path.id;
      neo4jUpdate = await main({
        actionType: 'deleteProjectNeo4j',
        node: {
          'id': projectId,
        }
      });
      const obj = await teamModel.remove({ teamId: { $eq: teamId } });
      if (obj.deletedCount >= 1) {
        return successResponse('Team Deleted Successfully',
        {
            "deletedCount": obj.deletedCount,
        });
      } else return failResponse(`Team Not Found`);
    } catch(err) {
      errorLogger("deleteTeam", err, "Error db call");
      return internalServer(`Error in deleting the mapping `);
    }
};