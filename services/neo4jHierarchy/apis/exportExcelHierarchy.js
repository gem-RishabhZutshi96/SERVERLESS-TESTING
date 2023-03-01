import { internalServer, forbiddenRequest, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
import { exportHierarchyExcel } from "../utils/exportExcel";
import { makeDBConnection } from "../../utilities/db/mongo";
import { viewModel } from "../../utilities/dbModels/view";
export const exportExcelHierarchy = async (event) => {
    try {
        devLogger("exportExcelHierarchy", event, "event");
        let userToken = null;
        await makeDBConnection();
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( auth.access !== "allowed") {
            return forbiddenRequest("❌❌  User is not allowed to access the data");
        }
        let source = event.path.source || event.pathParameters.source;
        const sourceViews = await viewModel.find({ 'name': { '$regex': source, '$options': 'i' } });
        if(sourceViews.length >= 1){
            let timestamp = new Date().toISOString();
            const resp = await exportHierarchyExcel({'fileName': 'hierarchyExcels' + '/' + timestamp + '--' +`${sourceViews[0].name}.xlsx`, 'relationName': sourceViews[0].relationName});
            return resp;
        } else {
            return badRequest("Invalid path parameters");
        }
    } catch (err) {
        errorLogger("exportExcelHierarchy", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};