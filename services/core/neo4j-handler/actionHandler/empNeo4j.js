import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
//import cryptoRandomString from 'crypto-random-string';
import { internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateEmpNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateEmpNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      // const exist = await session.run(
      //   `OPTIONAL MATCH (n:EMPLOYEE {EmployeeCode:"${event.node.EmployeeCode}"})
      //   RETURN n IS NOT NULL AS Predicate`);
      // if(!exist) {
      //   await session.run(`
      //      MERGE
      //      (${cryptoRandomString({length: 5, type: 'base64'})}:EMPLOYEE{EmployeeCode:"${event.node.EmployeeCode}", EmployeeName:"${event.node.EmployeeName}", Designation:"${event.node.Designation}", ImagePath:"${event.node.ImagePath}"})
      //     `);
      //   return successResponse('Node Created Successfully');
      // } else {
      //   await session.run(`
      //     MERGE
      //     (${cryptoRandomString({length: 5, type: 'base64'})}:EMPLOYEE{EmployeeCode:"${event.node.EmployeeCode}", EmployeeName:"${event.node.EmployeeName}", Designation:"${event.node.Designation}", ImagePath:"${event.node.ImagePath}"})
      //   `);
      //  return successResponse('Node Updated Successfully');
      //}
      await session.run(`
        CALL apoc.periodic.iterate("CALL apoc.load.json('${event.downloadURL}') YIELD value",
        "UNWIND value as emp \r\n"+ 
        "MERGE (emp.nodeId:EMPLOYEE{EmployeeCode:emp.EmployeeCode, EmployeeName:emp.EmployeeName, Designation:emp.Designation, ImagePath:emp.ImagePath, })",
        {batchSize:10000, iterateList:true});
      `);
    } catch (err) {
      errorLogger("createOrUpdateEmpNeo4j::::", err);
      console.log(err);
      return internalServer(`Error in Creating or Updating Node::::`);
    }
};

export const deleteEmpNeo4j = async (event) => {
  try {
    devLogger("deleteEmpNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    await session.run(
      `MATCH (n:EMPLOYEE {EmployeeCode:"${event.node.EmployeeCode}"})
      DETACH DELETE n`);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteEmpNeo4j::::", err);
    return internalServer(`Error in Deleting Node::::`);
  }
};