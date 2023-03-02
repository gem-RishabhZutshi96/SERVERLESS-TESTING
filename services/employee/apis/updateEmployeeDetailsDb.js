import { internalServer } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { updateEmployee } from "../../utilities/misc/updateEmployee";
import { devLogger, errorLogger } from "../utils/log-helper";
export const updateEmployeeDetailsDb = async (event) => {
    try {
        devLogger("updateEmployeeDetailsDb", event, "event");
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su', 'hr_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( !auth.success) {
            return auth;
        }
        const employeeID = event.path.id;
        const newEmployeeData = event.body;
        const response = await updateEmployee(employeeID, newEmployeeData);
        return response;
    } catch (err) {
        errorLogger("updateEmployeeDetailsDb", err, "Error db call");
        return internalServer(`Error in DB`);
    }
};