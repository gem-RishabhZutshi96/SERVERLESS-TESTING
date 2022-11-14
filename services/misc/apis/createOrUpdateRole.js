import { makeDBConnection } from "../../utilities/db/database";
import {RoleModel} from "../../utilities/dbModels/role";
import { internalServer } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
export const createOrUpdateRole = async(event) => {
    try{
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
      const filter = { email: event.body.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: event.body.role
        },
      };
      await RoleModel.updateOne(filter, updateDoc, options);
      let response = {
        success:true,
        email: event.body.email,
        role: event.body.role
      };
      return response;
    } catch(err) {
      throw internalServer(`Error in DB `, err);
    }
};