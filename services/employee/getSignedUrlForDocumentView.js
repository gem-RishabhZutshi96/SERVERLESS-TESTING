import { internalServer, forbiddenRequest, badRequest } from "../utilities/response/index";
import { accessAllowed } from "../utilities/validateToken/authorizer";
import { getUserToken } from "../utilities/validateToken/getUserToken";
import { s3SignedUrlDocuments } from "../utilities/s3SignedUrl/s3SignedUrlDocuments";
export const getSignedUrlForImageUpload = async (event) => {
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
        if (!event.body.key) {
            return badRequest("🤔🤔 Missing body parameters");
        }
        const employeeID = event.path.id;
        const { key } = event.body;
        const response = await s3SignedUrlDocuments('getSignedUrlForRetrieve', { key });
        return response;
    } catch (err) {
        console.log(err);
        throw internalServer(`Error in DB`, err);
    }
};