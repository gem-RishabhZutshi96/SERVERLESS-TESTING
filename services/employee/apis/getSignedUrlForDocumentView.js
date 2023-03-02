import { internalServer, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../../utilities/s3Utils/s3SignedUrlForDocuments";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getSignedUrlForDocumentView = async (event) => {
    try {
        devLogger("getSignedUrlForDocumentView", event, "event");
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
        if (!event.body.key) {
            return badRequest("🤔🤔 Missing body parameters");
        }
        const { key } = event.body;
        const response = await s3SignedUrlForDocuments('getSignedUrlForRetrieve', { key });
        return response;
    } catch (err) {
        errorLogger("getSignedUrlForDocumentView", err, "Error db call");
        return internalServer(`Error in DB`);
    }
};