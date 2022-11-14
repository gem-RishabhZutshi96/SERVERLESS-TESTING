import { makeDBConnection } from "../../utilities/db/database";
import { RoleModel } from "../../utilities/dbModels/role";
export const getRoleForUser = async(event) => {
    ("🔎Fetching role for user");
    let userRole = null;
    await makeDBConnection();
    const roleObj = await RoleModel.findOne({'email': {'$regex': `^${event.path.email}$`, $options: 'i'}});
    console.log("✌✌",roleObj);
    if (!roleObj) {
      userRole = "gemini";
    } else {
      userRole = roleObj.role;
    }
    let response = {
        statusCode: 200,
        message: "Data fetched successfully",
        data: userRole
    };
    return response;
};