import { internalServer, forbiddenRequest, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../../utilities/s3SignedUrl/s3SignedUrlForDocuments";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getSignedUrlForImageUpload = async (event) => {
    try {
        devLogger("getSignedUrlForImageUpload", event, "event");
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
        if (!(event.body.type || event.body.key || event.body.officialID || event.body.name || event.body.pimcoId)) {
            return badRequest("🤔🤔 Missing body parameters");
        }
        const { type, key, officialID, name, pimcoId } = event.body;
        // console.log({ type, key, officialID, name, pimcoId });
        const response = await s3SignedUrlForDocuments('getSignedUrlForImageUpload', { type, key, officialID, name, pimcoId });
        return response;
    } catch (err) {
        errorLogger("getSignedUrlForImageUpload", err, "Error db call");
        throw internalServer(`Error in DB`, err);
    }
};