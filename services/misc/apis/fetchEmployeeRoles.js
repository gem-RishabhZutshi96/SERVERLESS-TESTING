import { makeDBConnection } from "../../utilities/db/database";
import {RoleModel} from "../../utilities/dbModels/role";
import { internalServer } from "../../utilities/response/index";
import {validateToken} from "../../utilities/validateToken/validateToken";
import { devLogger, errorLogger } from "../utils/log-helper";
export const fetchEmployeeRoles = async(event) => {
    try{
      devLogger("fetchEmployeeRoles", event, "event");
      await makeDBConnection();
      let auth = validateToken(event);
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