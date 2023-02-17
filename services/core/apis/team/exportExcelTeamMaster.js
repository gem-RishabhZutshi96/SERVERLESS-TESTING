import { internalServer, forbiddenRequest, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import moment from 'moment';
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
        if ( auth.access !== "allowed") {
            return forbiddenRequest("❌❌  User is not allowed to access the data");
        }
        let timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
        const excelFilePath = await exportExcelDataTeamMaster('excels' + '/' + timestamp + '--' +`EmpMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelTeamMaster", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};