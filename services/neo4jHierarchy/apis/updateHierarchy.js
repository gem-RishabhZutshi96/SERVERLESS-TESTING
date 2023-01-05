import { makeDBConnection } from "../../utilities/db/mongo";
import { internalServer, badRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
import { main } from "../neo4j-handler/index";
import { parameterStore } from "../../utilities/config/commonData";
export const updateHierarchy = async(event) => {
    try{
        devLogger("updateHierarchy", event, "event");
        let userToken =null;
        let response;
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
        if(!(event.body.parentId || event.body.nodeId || event.body.view)){
            return badRequest("Missing body parameters");
        } else {
            const views = Object.entries(parameterStore[process.env.stage].sourceViews).filter(([key, value]) => generateRegex(event.body.view).test(key));
            if(views.length >= 1){
                const { parentId, nodeId } = event.body;
                response = await main({
                    actionType: 'updateHierarchy',
                    queryParams: {
                        parentId: parentId,
                        nodeId: nodeId,
                        relationName: views[0][1].relation
                    }
                });
            } else {
                return badRequest("Invalid View Name");
            }
        }
        return response;
    } catch(err) {
      errorLogger("updateHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};
function generateRegex(str) {
    return new RegExp(`${str}`,"i");
}