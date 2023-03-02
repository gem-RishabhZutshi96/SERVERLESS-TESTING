import { internalServer, forbiddenRequest, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { updateEmployee } from "../../utilities/misc/updateEmployee";
import { devLogger, errorLogger } from "../utils/log-helper";
export const documentImageUpload = async (event) => {
    try {
        devLogger("documentImageUpload", event, "event");
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su', 'hr_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( !auth.success) {
            return forbiddenRequest("❌❌User is not allowed to access the data");
        }
        if (!(event.body.key)) {
            return badRequest("Missing body parameters");
        }
        const { key } = event.body;
        const employeeID = event.path.id;
        const response = await updateEmployee(employeeID, {
            Image: key
        });
        return response;
    } catch (err) {
        errorLogger("documentImageUpload", err, "Error db call");
        return internalServer(`Error in DB`);
    }
};