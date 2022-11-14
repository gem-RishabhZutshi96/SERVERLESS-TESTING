import { makeDBConnection } from "../../utilities/db/database";
import {RoleModel} from "../../utilities/dbModels/role";
import { internalServer } from "../../utilities/response/index";
import {validateToken} from "../../utilities/validateToken/validateToken";
export const fetchEmployeeRoles = async(event) => {
    try{
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
      console.log(err);
      throw internalServer(`Error in DB `, err);
    }
};