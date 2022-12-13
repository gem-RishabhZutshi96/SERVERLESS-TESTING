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
      if(auth!=="allowed"){
        return auth;
      }
      const viewId = event.path.id;
      const obj = await viewModel.remove({ viewId: { $eq: viewId } });
      if (obj.deletedCount >= 1) {
        return successResponse("View Deleted Successfully",
          {
            "deletedCount": obj.deletedCount,
            "viewId": viewId
          }
        );
      } else {
        return failResponse(`View Not Found`, 404);
      }
    } catch(err) {
      errorLogger("deleteView", err, "Error db call");
      return internalServer(`Error in deleting the view `);
    }
};