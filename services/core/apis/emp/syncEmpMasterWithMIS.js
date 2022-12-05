import { makeDBConnection } from "../../../utilities/db/mongo";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import {getDataService} from "../../externalCall/getDataService";
export const syncEmpMasterWithMIS = async(event) => {
    try{
      devLogger("syncEmpMasterWithMIS", event, "event");
      let userToken =null;
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
      let createArray = [], updateArray = [], deleteArray = [];
      misData.Result.forEach(async emp => {
        let element = await employeeMasterModel.find({
          'officialEmail': {'$regex': `^${emp.EmailId}$`, $options: 'i'}
        });
        if(!element){
          createArray.push({
            "EmailId": emp["Email"] ? emp["Email"] : "",
            "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
            "EmployeeName": emp["EmployeeName"] ? emp["EmployeeName"] : "",
            "Department": emp["Department"] ? emp["Department"] : "",
            "Designation": emp["Designation"] ? emp["Designation"] : "",
            "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
            "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
            "Location": emp["Location"] ? emp["Location"] : "",
            "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
            "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
          });
        } else if(element &&
                  (emp.EmployeeCode != element.EmployeeCode ||
                  emp.EmployeeName != element.EmployeeName ||
                  emp.Department != element.Department ||
                  emp.Designation != element.Designation ||
                  emp.ReportingManager != element.ReportingManager ||
                  emp.ManagerCode != element.ManagerCode ||
                  emp.Location != element.Location ||
                  emp.ImagePath != element.ImagePath ||
                  emp.MobileNumber != element.MobileNumber))
            {
              updateArray.push({
                "EmailId": emp["Email"] ? emp["Email"] : "",
                "EmployeeCode": emp["EmployeeCode"] ? emp["EmployeeCode"] : "",
                "EmployeeName": emp["EmployeeName"] ? emp["EmployeeName"] : "",
                "Department": emp["Department"] ? emp["Department"] : "",
                "Designation": emp["Designation"] ? emp["Designation"] : "",
                "ReportingManager": emp["ReportingManager"] ? emp["ReportingManager"] : "",
                "ManagerCode": emp["ManagerCode"] ? emp["ManagerCode"] : "",
                "Location": emp["Location"] ? emp["Location"] : "",
                "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
                "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
            });
          } 
      });
      await employeeMasterModel.find().lean().forEach((document) => {
        let obj = misData.Result.find(data => data.EmailId == document.EmailId);
        if(!obj){
          deleteArray.push({
            "EmailId": document.EmailId
          });
        }
      });
      if(createArray.length >= 1){
        createArray.forEach(async emp =>{
          await employeeMasterModel.create(emp);
        })
      } else if(updateArray.length >= 1){
        updateArray.forEach(async emp =>{
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
            },
          };
          await employeeMasterModel.findOneAndUpdate(filter, updateDoc, options);
        })
      } else if(deleteArray.length >= 1){
        deleteArray.forEach(async emp =>{
          await employeeMasterModel.remove({ EmailId: { $eq: emp.EmailId } })
        })
      }
      return successResponse('Employee Master Table and Neo4J DB Synced Successfully with MIS');
    } catch(err) {
      errorLogger("syncEmpMasterWithMIS", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};