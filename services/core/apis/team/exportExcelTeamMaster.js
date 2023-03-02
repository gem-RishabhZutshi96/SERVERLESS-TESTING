import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { exportExcelDataTeamMaster } from "../../utils/exportExcel";
export const exportExcelTeamMaster = async (event) => {
    try {
        devLogger("exportExcelTeamMaster", event, "event");
        let userToken = null;
        userToken = getUserToken(event);
        let authQuery = {
            token: userToken,
            allowedFor: ['management_su']
        };
        let auth = await accessAllowed(authQuery);
        if ( !auth.success) {
            return auth;
        }
        let timestamp = new Date().toISOString();
        const excelFilePath = await exportExcelDataTeamMaster(`excels/${timestamp}__EmpMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelTeamMaster", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};