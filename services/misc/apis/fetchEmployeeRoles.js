import { makeDBConnection } from "../../utilities/db/database";
import {RoleModel} from "../../utilities/dbModels/role";
import { internalServer } from "../../utilities/response/index";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
import { urlStore } from "../../utilities/config/config";
import * as jwt from "jsonwebtoken";
export const fetchEmployeeRoles = async(event) => {
    try{
      devLogger("fetchEmployeeRoles", event, "event");
      await makeDBConnection();
      let userToken = getUserToken(event);
      const key =  urlStore[process.env.stage].JWT_SECRET;
      let auth = jwt.verify(userToken, key);
      if(auth.email){
        // Added a check to filter out logged in user role from resultant array....
        const roleObj = await RoleModel.find({email : {$nin : [auth.email]}});
        // const indexOfObject = roleObj.findIndex(object => {
        //   return object.email === auth.email.toLowerCase();
        // });
        // roleObj.splice(indexOfObject, 1);
        if(roleObj.length < 1){
          return {
            success: false,
            message: 'Roles Not Found',
          };
        }
        return {
          data: roleObj,
          success: true,
          message: 'Roles Fetched Successfully',
        };
      } else return auth;
    } catch(err) {
      errorLogger("fetchEmployeeRoles", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};