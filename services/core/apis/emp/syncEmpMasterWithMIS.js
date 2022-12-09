import { makeDBConnection } from "../../../utilities/db/mongo";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import {getDataService} from "../../externalCall/getDataService";
import { main } from "../../neo4j-handler/index";
import { parameterStore } from "../../../utilities/config/commonData";
import moment from 'moment';
import cryptoRandomString from 'crypto-random-string';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
export const syncEmpMasterWithMIS = async(event) => {
  try{
    devLogger("syncEmpMasterWithMIS", event, "event");
    let userToken =null;
    let  buf;
    let  data;
    let  timestamp;
    let  fileName;
    await makeDBConnection();
    userToken = getUserToken(event);
    let authQuery={
      token: userToken,
      allowedFor:['management_su']
    };
    let auth= await accessAllowed(authQuery);
    if(auth!=="allowed"){
      return auth;
    }
    let misData = await getDataService();
    let createArray = [];
    let updateArray = [];
    let deleteArray = [];
    let createNode = [];
    let updateNode = [];
    let deleteNode = [];
    misData.Result.forEach(async emp => {
      let element = await employeeMasterModel.find({
        'EmailId': {'$regex': `^${emp.Email}$`, $options: 'i'}
      });
      if(element.length < 1){
        createArray.push({
          "EmailId": emp["Email"] ? emp["Email"] : "",
          "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
          "EmployeeName": emp["EmployeeName"] ? emp["EmployeeName"] : "",
          "DepartmentName": emp["DepartmentName"] ? emp["DepartmentName"] : "",
          "Designation": emp["Designation"] ? emp["Designation"] : "",
          "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
          "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
          "Location": emp["Location"] ? emp["Location"] : "",
          "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
          "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
          "Experience": emp["Experience"] ?emp["Experience"] : "",
        });
      } else if(element.length >= 1 &&
                (emp.EmployeeCode != element.EmployeeCode ||
                emp.EmployeeName != element.EmployeeName ||
                emp.Department != element.Department ||
                emp.Designation != element.Designation ||
                emp.ReportingManager != element.ReportingManager ||
                emp.ManagerCode != element.ManagerCode ||
                emp.Location != element.Location ||
                emp.ImagePath != element.ImagePath ||
                emp.MobileNumber != element.MobileNumber ||
                emp.Experience != element.Experience))
          {
            updateArray.push({
              "EmailId": emp["Email"] ? emp["Email"] : "",
              "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
              "EmployeeName": emp["EmployeeName"] ? emp["EmployeeName"] : "",
              "DepartmentName": emp["DepartmentName"] ? emp["DepartmentName"] : "",
              "Designation": emp["Designation"] ? emp["Designation"] : "",
              "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
              "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
              "Location": emp["Location"] ? emp["Location"] : "",
              "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
              "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
              "Experience": emp["Experience"] ? emp["Experience"] : "",
          });
        }
    });
    const res = await employeeMasterModel.find();
    res.forEach(document => {
      let obj = misData.Result.find(emp => emp.Email == document.EmailId);
      if(obj == undefined){
        deleteArray.push({
          "EmailId": document.EmailId
        });
      }
    });
    if(createArray.length >= 1){
      const bulk = employeeMasterModel.collection.initializeOrderedBulkOp();
      createArray.forEach(async emp => {
        createNode.push({
          nodeId: cryptoRandomString({length: 5, type: 'base64'}),
          EmployeeCode: emp.EmployeeCode,
          EmployeeName: emp.EmployeeName,
          Designation: emp.Designation,
          ImagePath: emp.ImagePath,
          ManagerCode: emp.ManagerCode
        });
        await bulk.insert(emp);
      });
      await bulk.execute();
    }
    if(updateArray.length >= 1){
      updateArray.forEach(async emp => {
        const filter = { EmailId: emp.EmailId };
        const options = { upsert: false };
        const updateDoc = {
          $set: {
            EmployeeCode: emp.EmployeeCode,
            EmployeeName: emp.EmployeeName,
            Department: emp.Department,
            Designation: emp.Designation,
            ReportingManager: emp.ReportingManager,
            ManagerCode: emp.ManagerCode,
            Location: emp.Location,
            ImagePath: emp.ImagePath,
            MobileNumber: emp.MobileNumber,
            Experience: emp.Experience,
          },
        };
        updateNode.push({
          EmployeeCode: emp.EmployeeCode,
          EmployeeName: emp.EmployeeName,
          Designation: emp.Designation,
          ImagePath: emp.ImagePath,
          ManagerCode: emp.ManagerCode
        });
        await employeeMasterModel.updateMany(filter, updateDoc, options);
      });
    }
    buf = Buffer.from(JSON.stringify(
      {
        'createNode': createNode,
        'updateNode': updateNode
      }
    ));
    timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
    fileName = `json/${timestamp}--createNode.json`;
    data = {
      Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
      Key: fileName,
      ContentType: 'application/json',
      Body: buf
    };
    s3.config.update({
      accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
      secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
      region: parameterStore[process.env.stage].s3Params.region,
      signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
    });
    console.log("---- UPLODAING TO S3 ----");
    await s3.upload(data).promise();
    console.log("---- GETTING SIGNED URL FROM S3 ----");
    let downloadURL = s3.getSignedUrl("getObject",{
      Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
      Key: fileName,
      Expires: 3600
    });
    await main({
      actionType: 'createOrUpdateEmpNeo4j',
      s3JsonUrl: downloadURL
    });
    if(deleteArray.length >= 1) {
      deleteArray.forEach(async emp => {
        deleteNode.push({
          EmployeeCode: emp.EmployeeCode
        });
        await employeeMasterModel.remove({ EmailId: { $eq: emp.EmailId } });
      });
      buf = Buffer.from(JSON.stringify(createNode));
      timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
      fileName = `json/${timestamp}--createNode.json`;
      data = {
        Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
        Key: fileName,
        ContentType: 'application/json',
        Body: buf
      };
      s3.config.update({
        accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
        secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
        region: parameterStore[process.env.stage].s3Params.region,
        signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
      });
      console.log("---- UPLODAING TO S3 ----");
      await s3.upload(data).promise();
      console.log("---- GETTING SIGNED URL FROM S3 ----");
      let downloadURL = s3.getSignedUrl("getObject",{
        Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
        Key: fileName,
        Expires: 3600
      });
      await main({
        actionType: 'deleteEmpNeo4j',
        deleteUrl: downloadURL
      });
    }
    return successResponse('Employee Master Table and Neo4J DB Synced Successfully with MIS');
  } catch(err) {
    console.log(err);
    errorLogger("syncEmpMasterWithMIS", err, "Error db call");
    return internalServer(`Error in DB`);
  }
};