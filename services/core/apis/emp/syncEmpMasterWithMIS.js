import { makeDBConnection } from "../../../utilities/db/mongo";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
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
      misData.Result.array.forEach(emp => {
        let element = employeeMasterModel.find({
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
            "ReportingManagerId": emp["ReportingManagerId"] ? emp["ReportingManagerId"] : "",
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
                  emp.ReportingManagerId != element.ReportingManagerId ||
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
                "ReportingManagerId": emp["ReportingManagerId"] ? emp["ReportingManagerId"] : "",
                "Location": emp["Location"] ? emp["Location"] : "",
                "ImagePath": emp["ImagePath"] ? emp["ImagePath"] : "",
                "MobileNumber": emp["MobileNumber"] ? emp["MobileNumber"] : "",
            });
          } 
      });

    } catch(err) {
      errorLogger("syncEmpMasterWithMIS", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};