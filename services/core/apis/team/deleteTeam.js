import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { main } from "../../neo4j-handler/index";
import moment from "moment";
export const deleteTeam = async(event) => {
    try{
      devLogger("deleteTeam", event, "event");
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
      const teamId = event.path.id;
      const obj = await teamModel.findOneAndUpdate(
        { teamId: { $eq: teamId } },
        { $set: { 'isActive' : false, 'updatedAt': moment().format(), 'updatedBy': auth.userEmail } },
        {upsert: false}
      );
      if (obj) {
        await main({
          actionType: 'deleteTeamNeo4j',
          node: {
            'id': teamId,
            'updatedAt': moment().format(),
            'updatedBy': auth.userEmail,
          }
        });
        return successResponse('Team Deleted Successfully');
      } else return failResponse(`Team Not Found`, 404);
    } catch(err) {
      errorLogger("deleteTeam", err, "Error db call");
      return internalServer(`Error in deleting the mapping `);
    }
};