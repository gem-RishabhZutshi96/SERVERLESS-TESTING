import { employeeMasterModel } from "../../utilities/dbModels/employeeMaster";
import { projectModel } from "../../utilities/dbModels/project";
import { teamModel } from "../../utilities/dbModels/team";
import * as json2xls from 'json2xls';
import { devLogger, errorLogger } from "./log-helper";
import { parameterStore } from "../../utilities/config/commonData";
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

/**
 * @description Fetches all the documents in employee master collection with isActive flag true
 * and converts it into binary excel file and uploads to S3
 * @param  fileName file name of excel to be stored in S3
 * @yields url to download to excel file from S3
 */
export const exportExcelDataEmpMaster = async (fileName) => {
    try {
        devLogger("exportExcelDataEmpMaster", fileName, "event");
        const employees = await employeeMasterModel.find({isActive: true});
        const xls = json2xls(employees.map(emp => getEmpMasterJSON(emp)));
        const buffer = Buffer.from(xls, 'binary');
        s3.config.update({
            accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
            region: parameterStore[process.env.stage].s3Params.region,
            signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
        });
        await uploadToS3({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            ContentType: 'application/vnd.ms-excel',
            Body: buffer
        });
        let downloadURL = await getS3SignedUrl({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            Expires: 3600
        });
        return downloadURL;
    } catch (e) {
        errorLogger('Error in exporting employees master table excel ', e);
        throw e;
    }
};

/**
 * @description Fetches all the documents in project master collection with isActive flag true
 * and converts it into binary excel file and uploads to S3
 * @param  fileName file name of excel to be stored in S3
 * @yields url to download to excel file from S3
 */
export const exportExcelDataProjectMaster = async (fileName) => {
    try {
        devLogger("exportExcelDataProjectMaster", fileName, "event");
        const employees = await projectModel.find({isActive: true});
        const xls = json2xls(employees.map(emp => getProjectMasterJSON(emp)));
        const buffer = Buffer.from(xls, 'binary');
        s3.config.update({
            accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
            region: parameterStore[process.env.stage].s3Params.region,
            signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
        });
        await uploadToS3({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            ContentType: 'application/vnd.ms-excel',
            Body: buffer
        });
        let downloadURL = await getS3SignedUrl({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            Expires: 3600
        });
        return downloadURL;
    } catch (e) {
        errorLogger('Error in exporting project master table excel ', e);
        throw e;
    }
};

/**
 * @description Fetches all the documents in team master collection with isActive flag true
 * and converts it into binary excel file and uploads to S3
 * @param  fileName file name of excel to be stored in S3
 * @yields url to download to excel file from S3
 */
export const exportExcelDataTeamMaster = async (fileName) => {
    try {
        devLogger("exportExcelDataTeamMaster", fileName, "event");
        const employees = await teamModel.find({isActive: true});
        const xls = json2xls(employees.map(emp => getTeamMasterJSON(emp)));
        const buffer = Buffer.from(xls, 'binary');
        s3.config.update({
            accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
            region: parameterStore[process.env.stage].s3Params.region,
            signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
        });
        await uploadToS3({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            ContentType: 'application/vnd.ms-excel',
            Body: buffer
        });
        let downloadURL = await getS3SignedUrl({
            Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
            Key: fileName,
            Expires: 3600
        });
        return downloadURL;
    } catch (e) {
        errorLogger('Error in exporting team master table excel ', e);
        throw e;
    }
};

/**
 * @description Converts a single document in employee master collection to JSON object
 * @param  emp document in employee master collection
 * @yields JSON object of document in employee master collection
 */
function getEmpMasterJSON(emp) {
    const data = {
        'Email Id': emp.EmailId,
        'Employee Code': emp.EmployeeCode,
        'Employee Name': emp.name,
        'Department Name': emp.DepartmentName,
        'Designation': emp.Designation,
        'Reporting Manager': emp.ReportingManager,
        'Reporting Manager Id': emp.ManagerCode,
        'Location': emp.Location,
        'ImagePath': emp.ImagePath,
        'Mobile Number': emp.MobileNumber,
    };
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}

/**
 * @description Converts a single document in project master collection to JSON object
 * @param  emp document in project master collection
 * @yields JSON object of document in project master collection
 */
function getProjectMasterJSON(prj) {
    const data = {
        'Name': prj.name,
        'Project Id': prj.projectId,
        'Description': prj.description,
    };
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}

/**
 * @description Converts a single document in team master collection to JSON object
 * @param  emp document in team master collection
 * @yields JSON object of document in team master collection
 */
function getTeamMasterJSON(team) {
    const data = {
        'Name': team.name,
        'Team Id': team.teamId,
        'Description': team.description,
    };
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}

/**
 * @description Uploads binary data as a buffer to S3
 * @param  s3Data buffer data to upload to S3
 * @yields JSON object of document in team master collection
 */
async function uploadToS3(s3Data) {
    console.log("---- UPLODAING TO S3 ----",JSON.stringify(`${s3Data.Bucket} ${s3Data.Key}`, null, 2));
    try {
      return await s3.upload(s3Data).promise();
    } catch (error) {
      console.log(error);
      return error;
    }
}

/**
 * Creates signed url to upload excel file to S3
 * @param  params object containing bucket name, file name and expiration time of url
 * @yields JSON object of document in team master collection
 */
async function getS3SignedUrl(params) {
    console.log("---- GETTING SIGNED URL FROM S3 ----", JSON.stringify(params, null, 2));
    try {
      return s3.getSignedUrl("getObject", {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: params.Expires,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
}