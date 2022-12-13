import { makeDBConnection } from "../../../utilities/db/mongo";
import { roleMasterModel } from "../../../utilities/dbModels/roleMaster";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllRoles = async(event) => {
    try{
        devLogger("fetchAllRoles", event, "event");
        await makeDBConnection();
        const obj = await roleMasterModel.find();
        if(obj.length < 1){
            return failResponse('Roles Not Found');
        }
        return successResponse('Roles Fetched Successfully', obj);
    } catch(err) {
      errorLogger("fetchAllRoles", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};