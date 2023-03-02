import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer, failResponse, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { main } from "../../neo4j-handler/index";
export const deleteProject = async(event) => {
    try{
      devLogger("deleteProject", event, "event");
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
      const projectId = event.path.id;
      const obj = await projectModel.findOneAndUpdate(
        { projectId: { $eq: projectId } },
        { $set: { 'isActive' : false, 'updatedAt': new Date().toISOString(), 'updatedBy': auth.userEmail } },
        {upsert: false}
      );
      if (obj) {
        await main({
          actionType: 'deleteProjectNeo4j',
          node: {
            'id': projectId,
            'updatedAt': new Date().toISOString(),
            'updatedBy': auth.userEmail,
          }
        });
        return successResponse('Project Deleted Successfully');
      } else {
        return failResponse(`Project Not Found`, 404);
      }
    } catch(err) {
      errorLogger("deleteProject", err, "Error db call");
      return internalServer(`Error in deleting the mapping `);
    }
};