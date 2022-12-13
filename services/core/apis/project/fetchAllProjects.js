import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { failResponse, internalServer, successResponse } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllProjects = async(event) => {
    try{
        devLogger("fetchAllProjects", event, "event");
        await makeDBConnection();
        const obj = await projectModel.find();
        if(obj.length < 1){
            return failResponse('Projects Not Found', 404);
        }
        return successResponse('Projects Fetched Successfully', obj);
    } catch(err) {
      errorLogger("fetchAllProjects", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};