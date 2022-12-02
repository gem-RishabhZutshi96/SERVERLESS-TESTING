import { makeDBConnection } from "../../utilities/db/mongo";
import { RoleModel } from "../../utilities/dbModels/role";
import { devLogger, errorLogger,infoLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
export const getRoleForUser = async(event) => {
  try {
      devLogger("getRoleForUser", event, "event");
      let userRole = null;
      await makeDBConnection();
      const roleObj = await RoleModel.findOne({'email': {'$regex': `^${event.path.email}$`, $options: 'i'}});
      if (!roleObj) {
        userRole = "gemini";
      } else {
        infoLogger("roleObj", roleObj, "Success");
        userRole = roleObj.role;
      }
      let response = {
          statusCode: 200,
          message: "Data fetched successfully",
          data: userRole
      };
      return response;
    } catch(err) {
      errorLogger("getRoleForUser", err, "Error db call");
      throw internalServer(`Error in DB `, err);
  }
};