import { internalServer, forbiddenRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { s3SignedUrlForDocuments } from "../../utilities/s3SignedUrl/s3SignedUrlForDocuments";
export const getSignedUrlForDocumentUpload = async (event) => {
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
        const { type, key, officialID, name, pimcoId } = event.query;
        // console.log({ type, key, officialID, name, pimcoId });
        const response = await s3SignedUrlForDocuments('getSignedUrlForUpload', { type, key, officialID, name, pimcoId });
        return response;
    } catch (err) {
        console.log(err);
        throw internalServer(`Error in DB `, err);
    }
};