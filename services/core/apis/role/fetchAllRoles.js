import { makeDBConnection } from "../../../utilities/db/mongo";
import { roleMasterModel } from "../../../utilities/dbModels/roleMaster";
import { internalServer } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllRoles = async(event) => {
    try{
        devLogger("fetchAllRoles", event, "event");
        await makeDBConnection();
        const obj = await roleMasterModel.find();
        if(obj.length < 1){
            return {
                success: false,
                message: 'Roles Not Found',
            };
        } 
        return {
        data: obj,
        success: true,
        message: 'Roles Fetched Successfully',
        };
    } catch(err) {
      errorLogger("fetchAllRoles", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};