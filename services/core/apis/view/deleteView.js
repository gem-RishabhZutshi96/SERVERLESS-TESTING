import { makeDBConnection } from "../../../utilities/db/mongo";
import { viewModel } from "../../../utilities/dbModels/view";
import { internalServer } from "../../../utilities/response/index";
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
        return {
          data: {
            "deletedCount": obj.deletedCount,
            "email": email
          },
          success: true,
          message: 'View Deleted Successfully',
        };
      } else {
        return {
          success: false,
          message: `View Not Found`,
        };
      }
    } catch(err) {
      errorLogger("deleteView", err, "Error db call");
      throw internalServer(`Error in deleting the view `, err);
    }
};