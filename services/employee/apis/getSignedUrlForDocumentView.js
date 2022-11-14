import { internalServer, forbiddenRequest, badRequest } from "../utilities/response/index";
import { accessAllowed } from "../utilities/validateToken/authorizer";
import { getUserToken } from "../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../utilities/s3SignedUrl/s3SignedUrlForDocuments";
export const getSignedUrlForDocumentView = async (event) => {
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
        const { key } = event.body;
        const response = await s3SignedUrlForDocuments('getSignedUrlForRetrieve', { key });
        return response;
    } catch (err) {
        console.log(err);
        throw internalServer(`Error in DB`, err);
    }
};