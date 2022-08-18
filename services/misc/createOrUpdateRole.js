import { makeDBConnection } from "../utilities/db/database";
import {RoleModel} from "../utilities/dbModels/role";
import { internalServer } from "../utilities/response/index";
import { authorizer } from "../utilities/validateToken/authorizer";
export const createOrUpdateRole = async(event) => {
    try{
      let userToken =null;
      await makeDBConnection();
      if (event.headers.Authorization && event.headers.Authorization.split(' ')[0] === 'Token' ||
        event.headers.Authorization && event.headers.Authorization.split(' ')[0] === 'Bearer') {
        userToken = event.headers.Authorization.split(' ')[1];
      }
      let authQuery={
        token: userToken,
        allowedFor:['management_su','gemini']
      };
      let auth= await authorizer(authQuery);
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
        statusCode:200,
        email: event.body.email,
        role: event.body.role
      };
      return response;
    } catch(err) {
      throw internalServer(`Error in DB `, err);
    }
};