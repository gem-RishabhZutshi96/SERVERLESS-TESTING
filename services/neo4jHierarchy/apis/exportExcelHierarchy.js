import { internalServer, forbiddenRequest, successResponse } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import AWS from 'aws-sdk';
import { parameterStore } from "../../utilities/config/commonData";
import moment from 'moment';
import { devLogger, errorLogger } from "../utils/log-helper";
const s3 = new AWS.S3();
import { exportExcelDataProjectMaster } from "../utils/exportExcel";
export const exportExcelHierarchy = async (event) => {
    try {
        devLogger("exportExcelHierarchy", event, "event");
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
        s3.config.update({
            accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
            region: parameterStore[process.env.stage].s3Params.region,
            signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
        });
        let timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
        const excelFilePath = await exportExcelDataProjectMaster('excels' + '/' + timestamp + '--' +`ProjectMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelHierarchy", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};