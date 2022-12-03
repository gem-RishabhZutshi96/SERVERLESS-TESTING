import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllProjects = async(event) => {
    try{
        devLogger("fetchAllProjects", event, "event");
        await makeDBConnection();
        const obj = await projectModel.find();
        if(obj.length < 1){
            return {
                success: false,
                message: 'Projects Not Found',
            };
        } 
        return {
        data: obj,
        success: true,
        message: 'Projects Fetched Successfully',
        };
    } catch(err) {
      errorLogger("fetchAllProjects", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};