import { makeNeo4jDBConnection } from "../../utilities/db/neo4jdatabase";
import { badRequest } from "../../utilities/response/index";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { urlStore } from '../../utilities/config/config';
export const findEmployeeHierarchy = async(event) => {
  try {
      const { database } = urlStore[process.env.stage].NEO4J;
      devLogger("findEmployeeHierarchy", event, "event");
      let source = event.path.source || event.pathParameters.source;
      if(urlStore[process.env.stage].sourceViews.hasOwnProperty(`${source}`)){
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        let view = urlStore[process.env.stage].sourceViews[`${source}`];
        const result = await session.run(`
          MATCH p=(N1:EMPLOYEE {officialID:"${view.rootId}"})<-[:${view.relation}*]-()
          WITH COLLECT(p) AS ps
          CALL apoc.convert.toTree(ps) yield value
          RETURN apoc.convert.toJson(value);`
        );
        const resp =  result.records.map(i => i.get('apoc.convert.toJson(value)')).toString().replace(/rl_gemini/g,"Children");
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
      throw internalServer(`Error in DB `, err);
  }
};