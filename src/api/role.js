import { makeDBConnection } from "../lib/database";
import {RoleModel} from "../../models/role";
import { internalServer } from "../response/index";
import { authorizer } from "../utilities/authorizer";
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
      const result = await RoleModel.updateOne(filter, updateDoc, options);
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

export const getRoleForUser = async(event) => {
  console.log("🔎🔎 Fetch role for user 🔍🔍");
  let userRole = null;
  await makeDBConnection();
  const roleObj = await RoleModel.findOne({'email': {'$regex': `^${event.path.email}$`, $options: 'i'}});
  if (!roleObj) {
    userRole = "gemini";
  } else {
    userRole = roleObj.role;
  }
  let response = {
      statusCode:"200",
      message: JSON.stringify("Data fetched successfully"),
      data: userRole
  };
  return response;
};