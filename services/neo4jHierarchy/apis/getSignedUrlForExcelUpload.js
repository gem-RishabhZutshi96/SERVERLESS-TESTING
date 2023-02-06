import { internalServer, forbiddenRequest, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../../utilities/s3SignedUrl/s3SignedUrlForDocuments";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getSignedUrlForExcelUpload = async (event) => {
    try {
        devLogger("getSignedUrlForExcelUpload", event, "event");
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su', 'hr_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( auth.access !== "allowed") {
            return forbiddenRequest("❌❌User is not allowed to access the data");
        }
        const { type, key } = event.query || event.queryStringParameters;
        if(!type || !key){
            return badRequest('Missing Query Parameters');
        }
        const response = await s3SignedUrlForDocuments('getSignedUrlForUpload', { type, key});
        return response;
    } catch (err) {
        errorLogger("getSignedUrlForExcelUpload", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};