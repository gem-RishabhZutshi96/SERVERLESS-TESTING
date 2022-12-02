import { makeDBConnection } from "../db/mongo";
import {RoleModel} from "../dbModels/role";
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