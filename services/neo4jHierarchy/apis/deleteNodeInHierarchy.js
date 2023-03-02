import { makeDBConnection } from "../../utilities/db/mongo";
import { internalServer, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
import { main } from "../neo4j-handler/index";
import { viewModel } from "../../utilities/dbModels/view";
export const deleteNodeInHierarchy = async(event) => {
    try{
        devLogger("deleteNodeInHierarchy", event, "event");
        let userToken =null;
        let response;
        await makeDBConnection();
        userToken = getUserToken(event);
        let authQuery={
          token: userToken,
          allowedFor:['management_su']
        };
        let auth= await accessAllowed(authQuery);
        if( !auth.success){
            return auth;
        }
        if(!(event.body.nodeId || event.body.view)){
            return badRequest("Missing body parameters");
        } else {
            const views = await viewModel.find({ 'name': { '$regex': event.body.view, '$options': 'i' } });
            if(views.length >= 1){
                const { nodeId } = event.body;
                response = await main({
                    actionType: 'deleteNode',
                    queryParams: {
                        nodeId: nodeId,
                        relationName: views[0].relationName
                    }
                });
            } else {
                return badRequest("Invalid View Name");
            }
        }
        return response;
    } catch(err) {
        errorLogger("deleteNodeInHierarchy", err, "Error db call");
        return internalServer(`Error in DB `);
    }
};