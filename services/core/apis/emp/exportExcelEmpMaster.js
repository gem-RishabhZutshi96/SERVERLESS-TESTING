import AWS from 'aws-sdk';
import { dataStore } from "../../utilities/config/commonData";
import moment from 'moment';
const s3 = new AWS.S3();
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
        const excelFilePath = await exportExcelDataEmpMaster('excels' + '/' + timestamp + '--' +`EmpMasterTable.xlsx`);
        return successResponse("👍👍Excel Exported Successfully", excelFilePath);
    } catch (err) {
        errorLogger("exportExcelEmpMaster", err, "Error db call");
        throw internalServer(`Error in DB `, err);
    }
};