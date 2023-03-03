import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { exportExcelDataEmpMaster } from "../../utils/exportExcel";
export const exportExcelEmpMaster = async (event) => {
    try {
        devLogger("exportExcelEmpMaster", event, "event");
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
        const excelFilePath = await exportExcelDataEmpMaster(`excels/${timestamp}__EmpMasterTable.xlsx`);
        return successResponse("Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelEmpMaster", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};