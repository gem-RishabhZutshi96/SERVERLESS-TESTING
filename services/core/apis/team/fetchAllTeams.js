import { makeDBConnection } from "../../../utilities/db/mongo";
import { teamModel } from "../../../utilities/dbModels/team";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllTeams = async(event) => {
    try{
        devLogger("fetchAllTeams", event, "event");
        await makeDBConnection();
        const obj = await teamModel.find({isActive: true});
        if(obj.length < 1){
            return failResponse('Teams Not Found', 404);
        }
        return successResponse('Teams Fetched Successfully', obj);
    } catch(err) {
      errorLogger("fetchAllTeams", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};