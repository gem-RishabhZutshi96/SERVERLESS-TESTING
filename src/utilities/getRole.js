import { makeDBConnection } from "../lib/database";
import {RoleModel} from "../../models/role";
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