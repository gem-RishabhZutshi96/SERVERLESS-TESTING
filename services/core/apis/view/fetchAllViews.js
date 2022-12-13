import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { failResponse, internalServer, successResponse } from "../../../utilities/response/index";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const fetchAllViews = async(event) => {
    try{
        devLogger("fetchAllViews", event, "event");
        await makeDBConnection();
        const obj = await viewModel.find();
        if(obj.length < 1){
            return failResponse('Views Not Found', 404);
        }
        return successResponse('Views Fetched Successfully', obj);
    } catch(err) {
      errorLogger("fetchAllViews", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};