import { makeDBConnection } from "../../../utilities/db/mongo";
import { employeeMasterModel } from "../../../utilities/dbModels/employeeMaster";
import { internalServer } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllEmployeesMaster = async(event) => {
    try{
        devLogger("fetchAllEmployeesMaster", event, "event");
        await makeDBConnection();
        const obj = await employeeMasterModel.find();
        if(obj.length < 1){
            return {
                success: false,
                message: 'Employees Not Found',
            };
        } 
        return {
        data: obj,
        success: true,
        message: 'Employees Fetched Successfully',
        };
    } catch(err) {
      errorLogger("fetchAllEmployeesMaster", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};