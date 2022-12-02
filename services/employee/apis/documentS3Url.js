import { internalServer, forbiddenRequest, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { EmployeeModel } from "../../utilities/dbModels/employee";
import { resolveURL } from "../../utilities/resolveURL/resolve";
import { dataStore } from "../../utilities/config/commonData";
import { devLogger, errorLogger } from "../utils/log-helper";
export const documentS3Url = async (event) => {
    try {
        devLogger("documentS3Url", event, "event");
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
        if (!(event.body.path || event.body.type || event.body.key)) {
            return badRequest("🤔🤔 Missing body parameters");
        }
        const { path, type, key } = event.body;
        const employeeID = event.path.id;
        const response = await addDocumentToEmployee(employeeID, {
            path: path,
            key,
            type,
        });
        return response;
    } catch (err) {
        errorLogger("documentS3Url", err, "Error db call");
        throw internalServer(`Error in DB `, err);
    }
};
async function addDocumentToEmployee(_id, document) {
    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
        { _id },
        { $push: { Documents: document } },
        { new: true }
    ).select('Documents').lean();
    const { _id: documentId, key, path, type, } = (updatedEmployee.Documents).pop();
    const resolvedPath = resolveURL(dataStore[process.env.stage].domain, path);
    return {
        success: true,
        data: {
            _id,
            document: { key, type, path: resolvedPath, _id: documentId },
        },
        message: 'Document added',
    };
}