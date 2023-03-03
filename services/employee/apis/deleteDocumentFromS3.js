import { internalServer,  badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { EmployeeModel } from "../../utilities/dbModels/employee";
import { devLogger, errorLogger } from "../utils/log-helper";
import * as mongoose from 'mongoose';
import { s3SignedUrlForDocuments } from "../../utilities/s3Utils/s3SignedUrlForDocuments";
export const deleteDocumentFromS3 = async (event) => {
    try {
        devLogger("deleteDocumentFromS3", event, "event");
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
        if (!event.body.documentId) {
            return badRequest("Missing body parameters");
        }
        const employeeID = event.path.id;
        const { documentId } = event.body;
        const empObject = await getEmployeeObjectForS3DocumentDelete(documentId);
        await s3SignedUrlForDocuments('deleteDoc', empObject[0]);
        const finalResponse = await deleteEmployeeDocument( employeeID, documentId );
        return finalResponse;
    } catch (err) {
        errorLogger("deleteDocumentFromS3", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};
async function getEmployeeObjectForS3DocumentDelete(_id) {
    const docId = mongoose.Types.ObjectId(_id);
    let employeeObject = await EmployeeModel.aggregate([{$unwind: "$Documents"},{$match:{'Documents._id':docId}}]);
    return employeeObject;
}
async function deleteEmployeeDocument(_id, documentId) {
    await EmployeeModel.updateOne(
      { _id },
      { $pull: { Documents: { _id: documentId } } }
    );
    return {
      success: true,
      data: { _id, documentId },
      message: 'Document removed',
    };
}