import { internalServer, forbiddenRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { updateEmployee } from "../../utilities/misc/updateEmployee";
export const updateEmployeeDetailsDb = async (event) => {
    try {
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su', 'hr_su']
        };
        let auth = await accessAllowed(authQuery);
        if (auth !== "allowed") {
            return forbiddenRequest("❌❌User is not allowed to access the data");
        }
        const employeeID = event.path.id;
        const newEmployeeData = event.body;
        const response = await updateEmployee(employeeID, newEmployeeData);
        return response;
    } catch (err) {
        console.log(err);
        throw internalServer(`Error in DB`, err);
    }
};