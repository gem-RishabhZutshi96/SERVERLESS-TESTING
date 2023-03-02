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
      let countOfROOT=0;
      () => nodeData.map((emp) => {
        if(emp.nodeID==='ROOT'){
          return badRequest('Excel contains ROOT value in ID field');
        }
        if(emp.nodeParentID===emp.nodeID){
          return badRequest('Node ID and Parent Node ID cannot be same');
        }
        if(emp.nodeParentID===event.rootNodeID){
          countOfROOT++;
        }
      });
      if(countOfROOT===0){
        return badRequest('Excel does not contain ROOT in Parent ID field');
      }
      const allNodeIds = await session.executeRead(async tx => {
        const result = await tx.run(`
          UNWIND $nodeData as emp
          MATCH (a)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(a[k]) = emp.nodeID)
          WITH emp, COLLECT(emp.nodeID) AS nodeIds
          MATCH (b)
            WHERE ANY(k IN ['teamId', 'projectId', 'EmployeeCode'] WHERE toString(b[k]) = emp.nodeParentID)
          WITH nodeIds, COLLECT({nodeID:emp.nodeID, nodeParentID: emp.nodeParentID}) AS ids
          UNWIND ids AS nIds
          RETURN nIds
        `,{nodeData: nodeData});
        return result.records.map(record => record.get('nIds'));
      });
      if(allNodeIds.length == nodeData.length){
        return successResponse("Data Validation is Successfull", []);
      }
      const results = nodeData.filter(item1 => !allNodeIds.some(item2 => (item2.nodeID === item1.nodeID && item2.nodeParentID === item1.nodeParentID)));
      return failResponse('Data contains IDs which are non existent in DB', 500, results);
    } catch (err) {
      errorLogger("verifyData ", err);
      throw internalServer(`Error in Data Verification `);
    }
};