import { badRequest } from "../../utilities/response/index";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { parameterStore } from '../../utilities/config/commonData';
import { main } from "../neo4j-handler";
export const fetchEmployeeHierarchy = async(event) => {
  try {
      devLogger("fetchEmployeeHierarchy", event, "event");
      let source = event.path.source || event.pathParameters.source;
      if(parameterStore[process.env.stage].sourceViews.hasOwnProperty(`${source}`)){
        const resp = await main({
          actionType: 'fetchHierarchy',
          source: source
        });
        let response = {
          success: resp.success,
          message: resp.message,
          data: JSON.parse(resp.data)
        };
        return response;
      } else {
        return badRequest("Invalid path parameters");
      }
    } catch(err) {
      errorLogger("fetchEmployeeHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
  }
};