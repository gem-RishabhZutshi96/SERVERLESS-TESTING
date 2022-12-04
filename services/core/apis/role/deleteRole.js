import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const deleteRole = async(event) => {
    try{
      devLogger("deleteRole", event, "event");
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
      const roleId = event.path.id;
      const obj = await projectModel.remove({ roleId: { $eq: roleId } });
      if (obj.deletedCount >= 1) {
        return {
          data: {
            "deletedCount": obj.deletedCount,
            "email": email
          },
          success: true,
          message: 'Role Deleted Successfully',
        };
      } else {
        return {
          success: false,
          message: `Role Not Found`,
        };
      }
    } catch(err) {
      errorLogger("deleteRole", err, "Error db call");
      throw internalServer(`Error in deleting the role `, err);
    }
};