import { makeDBConnection } from "../../../utilities/db/mongo";
import { roleMasterModel } from "../../../utilities/dbModels/roleMaster";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
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
      if( auth.access !=="allowed"){
        return auth;
      }
      const roleId = event.path.id;
      const obj = await roleMasterModel.remove({ roleId: { $eq: roleId } });
      if (obj.deletedCount >= 1) {
        return successResponse('Role Deleted Successfully',
        {
          "deletedCount": obj.deletedCount,
          "roleId": roleId
        });
      } else {
        return failResponse(`Role Not Found`, 404);
      }
    } catch(err) {
      errorLogger("deleteRole", err, "Error db call");
      return internalServer(`Error in deleting the role `);
    }
};