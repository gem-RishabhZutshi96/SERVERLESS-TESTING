import { makeDBConnection } from "../../../utilities/db/mongo";
import { projectModel } from "../../../utilities/dbModels/project";
import { internalServer, badRequest, successResponse, failResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { main } from "../../neo4j-handler/index";
import cryptoRandomString from 'crypto-random-string';
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
      if(event.body.projectId){
        await main({
          actionType: 'createOrUpdateProjectNeo4j',
          node: {
            'id': event.body.projectId,
            'name': event.body.name,
            'description': event.body.description
          }
        });
        let result = await projectModel.findOneAndUpdate(
          {
            projectId: event.body.projectId
          },
          event.body,
          {
            upsert: false
          }
        );
        if(result){
            return successResponse('Project Updated Successfully');
        } else{
            return failResponse('No info found to updated');
        }
      } else if(!(event.body.name || event.body.description)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const docToInsert = {
          name: event.body.name,
          description: event.body.description,
          projectId: 'P_'.concat(cryptoRandomString({length: 6, type: 'url-safe'})),
        };
        await main({
          actionType: 'createOrUpdateProjectNeo4j',
          node: {
            'id': docToInsert.projectId,
            'name': event.body.name,
            'description': event.body.description
          }
        });
        await projectModel.create(docToInsert);
        return successResponse('Project Added Successfully', docToInsert);
      }
    } catch(err) {
      errorLogger("createOrUpdateProject", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};