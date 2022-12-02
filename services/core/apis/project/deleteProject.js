import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
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
      if(auth!=="allowed"){
        return auth;
      }
      const projectId = event.path.id;
      const obj = await projectModel.remove({ projectId: { $eq: projectId } });
      if (obj.deletedCount >= 1) {
        return {
          data: {
            "deletedCount": obj.deletedCount,
            "email": email
          },
          success: true,
          message: 'Project Deleted Successfully',
        };
      } else {
        return {
          success: false,
          message: `Project Not Found`,
        };
      }
    } catch(err) {
      errorLogger("deleteProject", err, "Error db call");
      throw internalServer(`Error in deleting the mapping `, err);
    }
};