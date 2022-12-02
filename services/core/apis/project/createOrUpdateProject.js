import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateProject = async(event) => {
    try{
      devLogger("createOrUpdateProject", event, "event");
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
      const filter = { projectId: event.body.projectId };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: event.body.name,
          description: event.body.description
        },
      };
      await projectModel.updateOne(filter, updateDoc, options);
      let response = {
        success:true,
        name: event.body.name,
        projectId: event.body.projectId
      };
      return response;
    } catch(err) {
      errorLogger("createOrUpdateProject", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};