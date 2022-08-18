import { makeDBConnection } from "../utilities/db/database";
import {RoleModel} from "../utilities/dbModels/role";
export const getUserRole = async(email) => {
    let userRole = null;
    await makeDBConnection();
    const roleObj = await RoleModel.findOne({'email': {'$regex': `^${email}$`, $options: 'i'}});
    if (!roleObj) {
      userRole = "gemini";
    } else {
      userRole = roleObj.role;
    }
    return userRole;
  };