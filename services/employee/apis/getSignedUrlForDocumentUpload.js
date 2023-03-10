import { internalServer } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../../utilities/s3Utils/s3SignedUrlForDocuments";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getSignedUrlForDocumentUpload = async (event) => {
    try {
        devLogger("getSignedUrlForDocumentUpload", event, "event");
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
        const { type, key, officialID, name, pimcoId } = event.query || event.queryStringParameters;
        const response = await s3SignedUrlForDocuments('getSignedUrlForUpload', { type, key, officialID, name, pimcoId });
        return response;
    } catch (err) {
        errorLogger("getSignedUrlForDocumentUpload", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};