import { makeDBConnection } from "../../utilities/db/database";
import {RoleModel} from "../../utilities/dbModels/role";
import { internalServer } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
export const deleteRoles = async(event) => {
    try{
      devLogger("deleteRoles", event, "event");
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
      const email = event.body.email;
      const roleObj = await RoleModel.remove({ email: { $eq: email } });
      if (roleObj.deletedCount >= 1) {
        return {
          data: {
            "deletedCount": roleObj.deletedCount,
            "email": email
          },
          success: true,
          message: 'Roles Deleted Successfully',
        };
      } else {
        return {
          success: false,
          message: `No role exists for this user : ${email}`,
        };
      }
    } catch(err) {
      errorLogger("deleteRoles", err, "Error db call");
      throw internalServer(`Error in deleting the roles `, err);
    }
};