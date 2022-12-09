import { makeNeo4jDBConnection } from "../../utilities/db/neo4j";
import { badRequest } from "../../utilities/response/index";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { parameterStore } from '../../utilities/config/commonData';
export const findEmployeeHierarchy = async(event) => {
  try {
      const { database } = parameterStore[process.env.stage].NEO4J;
      devLogger("findEmployeeHierarchy", event, "event");
      let source = event.path.source || event.pathParameters.source;
      if(parameterStore[process.env.stage].sourceViews.hasOwnProperty(`${source}`)){
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        let view = parameterStore[process.env.stage].sourceViews[`${source}`];
        const result = await session.run(`
          MATCH p=(:EMPLOYEE {officialID:"${view.rootId}"})<-[:${view.relation}*]-()
          WITH COLLECT(p) AS ps
          CALL apoc.convert.toTree(ps) yield value
          RETURN apoc.convert.toJson(value);`
        );
        const regex = generateRegex(view.relation);
        const resp =  result.records.map(i => i.get('apoc.convert.toJson(value)')).toString().replace(regex,"children");
        let response = {
          success: true,
          message: "Hierarchy fetched successfully",
          data: JSON.parse(resp)
        };
        return response;
      } else {
        return badRequest("Invalid path parameters");
      }
    } catch(err) {
      errorLogger("findEmployeeHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
  }
};
function generateRegex(str) {
  return new RegExp(`${str}`,"ig");
}