import { makeNeo4jDBConnection } from "../../utilities/db/neo4j";
import { parameterStore } from "../../utilities/config/commonData";
import { badRequest, internalServer, successResponse } from "../../utilities/response";
import { devLogger, errorLogger } from "../utils/log-helper";
export const createHierarchyInDB = async (event) => {
    try {
        devLogger("createHierarchyInDB", event, "event");
        const { database } = parameterStore[process.env.stage].NEO4J;
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        const nodeData = event.nodeData;
        if(!nodeData || !event.relationName || nodeData.length < 1){
            return badRequest("Invalid Data Recieved");
        }
        await session.run(`
            UNWIND $nodeData as emp
            MATCH (a)
                WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = emp.nodeID)
            MATCH (b)
                WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = emp.nodeParentID)
            CALL apoc.create.relationship(a, $relN, {isActive:true, startDate: $startDate, endDate:""}, b) YIELD rel
            SET rel.rIndex = id(rel)
            RETURN rel
            `,{nodeData: nodeData, relN: event.relationName, startDate: new Date().toISOString()});
        return successResponse("Hierarchy is created successfully in DB", []);
    } catch (err) {
      errorLogger("createHierarchyInDB ", err);
      throw internalServer(`Error in Creating or Updating Node `);
    }
};