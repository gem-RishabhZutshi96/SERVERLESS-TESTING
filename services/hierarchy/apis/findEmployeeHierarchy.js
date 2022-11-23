import { makeNeo4jDBConnection } from "../../utilities/db/neo4jdatabase";
import { badRequest } from "../../utilities/response/index";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { urlStore } from '../../utilities/config/config';
export const findEmployeeHierarchy = async(event) => {
  try {
      const { database } = urlStore[process.env.stage].NEO4J;
      devLogger("findEmployeeHierarchy", event, "event");
      if(!(event.body.relation || event.body.empName)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const { relation, empName } = event.body;
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        if(!empName){
          const result = await session.run(`
          MATCH p=(N1:EMPLOYEE)-[:${relation}*]->(N2:EMPLOYEE)
          WITH COLLECT(p) AS ps
          CALL apoc.convert.toTree(ps) yield value
          RETURN value;`);
        let response = {
          success: true,
          message: "Nodes fetched successfully",
          data: result.records.map(i => i.get('value'))
        };
        return response;
        } else {
          const result = await session.run(`
          MATCH p=(N1)-[:${relation}*]->(N2:EMPLOYEE {Name:"${empName}*"})
          WITH COLLECT(p) AS ps
          CALL apoc.convert.toTree(ps) yield value
          RETURN value;`);
          let response = {
            success: true,
            message: "Nodes fetched successfully",
            data: result.records.map(i => i.get('value'))
          };
          return response;
        }
      }
    } catch(err) {
      errorLogger("findEmployeeHierarchy", err, "Error db call");
      console.log(err);
      throw internalServer(`Error in DB `, err);
  }
};