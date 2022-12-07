import { makeDBConnection } from "../../../utilities/db/mongo";
import { empRoleMapModel } from "../../../utilities/dbModels/empRoleMap";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const deleteMapping = async(event) => {
    try{
      devLogger("deleteMapping", event, "event");
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
      const email = event.path.email;
      const obj = await empRoleMapModel.remove({ email: { $eq: email } });
      if (obj.deletedCount >= 1) {
        return successResponse('Mapping Deleted Successfully',
        {
          "deletedCount": obj.deletedCount,
          "email": email
        });
      } else {
        return failResponse(`No mapping exists for this user : ${email}`);
      }
    } catch(err) {
      errorLogger("deleteMapping", err, "Error db call");
      throw internalServer(`Error in deleting the mapping `, err);
    }
};