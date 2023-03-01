import { internalServer, forbiddenRequest, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { exportExcelDataProjectMaster } from "../../utils/exportExcel";
export const exportExcelProjectMaster = async (event) => {
    try {
        devLogger("exportExcelProjectMaster", event, "event");
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( auth.access !== "allowed") {
            return forbiddenRequest("❌❌  User is not allowed to access the data");
        }
        let timestamp = new Date().toISOString();
        const excelFilePath = await exportExcelDataProjectMaster('excels' + '/' + timestamp + '--' +`ProjectMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelProjectMaster", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};