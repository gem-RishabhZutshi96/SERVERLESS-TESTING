import { makeDBConnection } from "../../../utilities/db/mongo";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import {getDataService} from "../../externalCall/getDataService";
import { main } from "../../neo4j-handler/index";
import { parameterStore } from "../../../utilities/config/commonData";
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
s3.config.update({
  accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
  secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
  region: parameterStore[process.env.stage].s3Params.region,
  signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
});
export const syncEmpMasterWithMIS = async(event) => {
  try{
    devLogger("syncEmpMasterWithMIS", event, "event");
    let userToken =null;
    // let buf;
    // let data;
    // let timestamp;
    // let fileName;
    await makeDBConnection();
    userToken = getUserToken(event);
    let authQuery={
      token: userToken,
      allowedFor:['management_su']
    };
    let auth= await accessAllowed(authQuery);
    if( !auth.success){
      return auth;
    }
    let misData = await getDataService();
    let allEmp = await employeeMasterModel.find({isActive: true});
    let createArray = [];
    let updateNode = [];
    let updateArray = [];
    let deleteArray = [];
    misData.Result.forEach(async emp => {
      let element = allEmp.filter(el => (generateRegex(emp.EmailId).test(el.EmailId)));
      if(element.length < 1){
        createArray.push({
          "EmailId": emp["EmailId"] ? emp["EmailId"] : "",
          "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
          "name": emp["EmployeeName"] ? emp["EmployeeName"] : "",
          "DepartmentName": emp["DepartmentName"] ? emp["DepartmentName"] : "",
          "Designation": emp["Designation"] ? emp["Designation"] : "",
          "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
          "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
          "Location": emp["Location"] ? emp["Location"] : "",
          "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
          "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
          "Experience": emp["Experience"] ? emp["Experience"] : "",
          "ECTech": emp["ECTech"] ? emp["ECTech"] : "",
          "DCTech": emp["DCTech"] ? emp["DCTech"] : "",
          "isActive": true,
          "createdAt": new Date().toISOString(),
          "createdBy": auth.userEmail,
          "updatedAt": "",
          "updatedBy": "",
        });
      }
      if(element.length >= 1
        && (emp.EmployeeCode != element[0].EmployeeCode ||
        emp.EmployeeName != element[0].name ||
        emp.Designation != element[0].Designation ||
        emp.ManagerCode != element[0].ManagerCode ||
        emp.ImagePath != element[0].ImagePath ||
        emp.ECTech != element[0].ECTech ||
        emp.DCTech != element[0].DCTech)) {
        updateNode.push({
          "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
          "name": emp["EmployeeName"] ? emp["EmployeeName"] : "",
          "Designation": emp["Designation"] ? emp["Designation"] : "",
          "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
          "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
          "ECTech": emp["ECTech"] ? emp["ECTech"] : "",
          "DCTech": emp["DCTech"] ? emp["DCTech"] : "",
          "isActive": true,
          "updatedAt": new Date().toISOString(),
          "updatedBy": auth.userEmail,
        });
      }
      if(element.length >= 1
        && (emp.EmployeeCode != element[0].EmployeeCode ||
        emp.EmployeeName != element[0].name ||
        emp.DepartmentName != element[0].DepartmentName ||
        emp.Designation != element[0].Designation ||
        emp.ReportingManager != element[0].ReportingManager ||
        emp.ManagerCode != element[0].ManagerCode ||
        emp.Location != element[0].Location ||
        emp.ImagePath != element[0].ImagePath ||
        emp.MobileNumber != element[0].MobileNumber ||
        emp.Experience != element[0].Experience ||
        emp.ECTech != element[0].ECTech ||
        emp.DCTech != element[0].DCTech)) {
        updateArray.push({
          "EmailId": emp["EmailId"] ? emp["EmailId"] : "",
          "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
          "name": emp["EmployeeName"] ? emp["EmployeeName"] : "",
          "DepartmentName": emp["DepartmentName"] ? emp["DepartmentName"] : "",
          "Designation": emp["Designation"] ? emp["Designation"] : "",
          "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
          "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
          "Location": emp["Location"] ? emp["Location"] : "",
          "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
          "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
          "Experience": emp["Experience"] ? emp["Experience"] : "",
          "ECTech": emp["ECTech"] ? emp["ECTech"] : "",
          "DCTech": emp["DCTech"] ? emp["DCTech"] : "",
          "isActive": true,
          "updatedAt": new Date().toISOString(),
          "updatedBy": auth.userEmail,
        });
      }
    });
    allEmp.forEach(document => {
      let obj = misData.Result.find(emp => emp.EmailId == document.EmailId);
      if(obj == undefined){
        deleteArray.push(document.EmailId);
      }
    });
    if(createArray.length >= 1){
      // const bulk = employeeMasterModel.collection.initializeOrderedBulkOp();
      createArray.forEach(async emp => {
        await employeeMasterModel.create(emp);
      });
      // await bulk.execute();
      // const resp = await employeeMasterModel.insertMany(createArray);
    }
    if(updateArray.length >= 1){
      updateArray.forEach(async emp => {
        const filter = { EmailId: emp.EmailId };
        const options = { upsert: false };
        const updateDoc = {
          $set: {
            EmployeeCode: emp.EmployeeCode,
            name: emp.EmployeeName,
            DepartmentName: emp.DepartmentName,
            Designation: emp.Designation,
            ReportingManager: emp.ReportingManager,
            ManagerCode: emp.ManagerCode,
            Location: emp.Location,
            ImagePath: emp.ImagePath,
            MobileNumber: emp.MobileNumber,
            Experience: emp.Experience,
            ECTech: emp.ECTech,
            DCTech: emp.DCTech,
            isActive: emp.isActive,
            updatedAt: emp.updatedAt,
            updatedBy: emp.updatedBy
          },
        };
        await employeeMasterModel.updateMany(filter, updateDoc, options);
      });
    }
    if(createArray.length >= 1 || updateNode.length >= 1){
      // buf = Buffer.from(JSON.stringify(
      //   {
      //     'createNode': createArray,
      //     'updateNode': updateNode
      //   }
      // ));
      // timestamp = new Date().toISOString();
      // fileName = `json/${timestamp}--createOrUpdateNode.json`;
      // data = {
      //   Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
      //   Key: fileName,
      //   ContentType: 'application/json',
      //   Body: buf
      // };
      // console.log("---- UPLODAING TO S3 ----");
      // await s3.upload(data).promise();
      // console.log("---- GETTING SIGNED URL FROM S3 ----");
      // let downloadURL = s3.getSignedUrl("getObject",{
      //   Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
      //   Key: fileName,
      //   Expires: 3600
      // });
      // await main({
      //   actionType: 'createOrUpdateEmpNeo4j',
      //   s3JsonUrl: downloadURL
      // });
      await main({
        actionType: 'createOrUpdateEmpNeo4j',
        createArray: createArray,
        updateNode: updateNode
      });
    }
    if(deleteArray.length >= 1) {
      await employeeMasterModel.remove.findOneAndUpdate(
        { EmailId: { $in: deleteArray } },
        { $set: { 'isActive' : false, 'updatedAt': new Date().toISOString(), 'updatedBy': auth.userEmail } },
        {upsert: false}
      );
      // await employeeMasterModel.remove({ EmailId: { $in: deleteArray } });
      // buf = Buffer.from(JSON.stringify(
      //   {'deleteNode': deleteArray}));
      // timestamp = new Date().toISOString();
      // fileName = `json/${timestamp}--deleteNode.json`;
      // data = {
      //   Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
      //   Key: fileName,
      //   ContentType: 'application/json',
      //   Body: buf
      // };
      // console.log("---- UPLODAING TO S3 ----");
      // await s3.upload(data).promise();
      // console.log("---- GETTING SIGNED URL FROM S3 ----");
      // let downloadURL = s3.getSignedUrl("getObject",{
      //   Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
      //   Key: fileName,
      //   Expires: 3600
      // });
      // await main({
      //   actionType: 'deleteEmpNeo4j',
      //   deleteUrl: downloadURL
      // });
      await main({
        actionType: 'createOrUpdateEmpNeo4j',
        deleteArray: deleteArray
      });
    }
    return successResponse('Employee Master Table and Neo4J DB Synced Successfully with MIS');
  } catch(err) {
    errorLogger("syncEmpMasterWithMIS", err, "Error db call");
    return internalServer(`Error in DB`);
  }
};
function generateRegex(str) {
  return new RegExp(`${str}`,"i");
}