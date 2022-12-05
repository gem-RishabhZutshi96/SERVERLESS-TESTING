import { internalServer, forbiddenRequest, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import AWS from 'aws-sdk';
import { dataStore } from "../../../utilities/config/commonData";
import moment from 'moment';
import { devLogger, errorLogger } from "../../utils/log-helper";
const s3 = new AWS.S3();
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
        if (auth !== "allowed") {
            return forbiddenRequest("❌❌  User is not allowed to access the data");
        }
        s3.config.update({
            accessKeyId: dataStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: dataStore[process.env.stage].s3Params.secretAccessKey,
            region: dataStore[process.env.stage].s3Params.region,
            signatureVersion: dataStore[process.env.stage].s3Params.signatureVersion
        });
        let timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
        const excelFilePath = await exportExcelDataProjectMaster('excels' + '/' + timestamp + '--' +`ProjectMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelProjectMaster", err, "Error db call");
        throw internalServer(`Error in DB `, err);
    }
};