import { makeDBConnection } from "../../../utilities/db/mongo";
import { empRoleMapModel } from "../../../utilities/dbModels/empRoleMap";
import { internalServer } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateMapping = async(event) => {
    try{
      devLogger("createOrUpdateMapping", event, "event");
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
      const filter = { email: event.path.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          roleId: event.body.roleId
        },
      };
      await empRoleMapModel.updateOne(filter, updateDoc, options);
      let response = {
        success: true,
        email: event.body.email,
        roleId: event.body.roleId
      };
      return response;
    } catch(err) {
      errorLogger("createOrUpdateMapping", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};