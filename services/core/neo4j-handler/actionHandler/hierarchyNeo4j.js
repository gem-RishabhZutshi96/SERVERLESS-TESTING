import { makeNeo4jDBConnection } from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { internalServer } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createHierarchyForExcel = async (event) => {
    try {
      devLogger("createHierarchyForExcel", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const nodeData = event.nodeData;
      await session.run(`
        UNWIND $nodeData as emp
        MATCH (a)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeID)
        MATCH (b)
          WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.nodeParentID)
        MERGE (a)-[r:reportsTo]->(b)
        RETURN r
      `,{nodeData: nodeData});
    } catch (err) {
      errorLogger("createHierarchyForExcel::::", err);
      throw internalServer(`Error in Creating or Updating Node::::`);
    }
};