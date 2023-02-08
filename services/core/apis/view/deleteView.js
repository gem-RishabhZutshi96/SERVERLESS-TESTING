import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const deleteView = async(event) => {
    try{
      devLogger("deleteView", event, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su']
      };
      let auth= await accessAllowed(authQuery);
      if( auth.access !=="allowed"){
        return auth;
      }
      const viewId = event.path.id;
      const obj = await viewModel.findOneAndUpdate(
        { viewId: { $eq: viewId } },
        { $set: { "isActive" : false } },
        {upsert: false}
      );
      if (obj) {
        return successResponse("View Deleted Successfully");
      } else {
        return failResponse(`View Not Found`, 404);
      }
    } catch(err) {
      errorLogger("deleteView", err, "Error db call");
      return internalServer(`Error in deleting the view `);
    }
};