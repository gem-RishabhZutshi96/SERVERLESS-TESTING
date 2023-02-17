import { makeNeo4jDBConnection } from "../../utilities/db/neo4j";
import { parameterStore } from "../../utilities/config/commonData";
import { badRequest, failResponse, internalServer, successResponse } from "../../utilities/response";
import { devLogger, errorLogger } from "../utils/log-helper";
export const verifyData = async (event) => {
    try {
      devLogger("verifyData", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const nodeData = event.nodeData;
      if(!nodeData || nodeData.length < 1){
        return badRequest("Invalid Data Recieved");
      }
      const allNodeIds = await session.executeRead(async tx => {
        const result = await tx.run(`
          UNWIND $nodeData as emp
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) CONTAINS emp.nodeID)
          WITH emp, COLLECT(emp.nodeID) AS nodeIds
          MATCH (b)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) CONTAINS emp.nodeParentID)
          WITH nodeIds, COLLECT({nodeID:emp.nodeID, nodeParentID: emp.nodeParentID}) AS ids
          UNWIND ids AS nIds
          RETURN nIds
        `,{nodeData: nodeData});
        return result.records.map(record => record.get('nIds'));
      });
      if(allNodeIds.length == nodeData.length){
        return successResponse("Data Validation is Successfull", []);
      }
      return failResponse('Data contains IDs which are non existent in DB',[]);
    } catch (err) {
      errorLogger("verifyData ", err);
      throw internalServer(`Error in Data Verification `);
    }
};