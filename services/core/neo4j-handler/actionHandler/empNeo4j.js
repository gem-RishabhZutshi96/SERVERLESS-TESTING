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
      await session.run(`
        CALL apoc.load.json("${event.s3JsonUrl}") YIELD value
        UNWIND value as nodes
        FOREACH (emp in nodes.createNode |
          CREATE (a:EMPLOYEE {EmployeeCode:emp.EmployeeCode,
          EmployeeName:emp.EmployeeName, 
          Designation:emp.Designation, 
          ImagePath:emp.ImagePath,
          ManagerCode:emp.ManagerCode}))
        WITH nodes
        UNWIND nodes.updateNode as emps
          WITH emps
          MATCH (a:EMPLOYEE{EmployeeCode:emps.EmployeeCode})
          WITH a, emps
          SET a.EmployeeName = emps.EmployeeName, 
              a.Designation = emps.Designation, 
              a.ImagePath = emps.ImagePath,
              a.ManagerCode = emps.ManagerCode
        WITH emps
        MATCH (n:EMPLOYEE)
        WITH n
        MATCH (parent:EMPLOYEE {EmployeeCode:n.ManagerCode})
        MERGE (n)-[:RL_Gemini]->(parent)
      `);
    } catch (err) {
      errorLogger("createOrUpdateEmpNeo4j::::", err);
      throw internalServer(`Error in Creating or Updating Node::::`);
    }
};

export const deleteEmpNeo4j = async (event) => {
  try {
    devLogger("deleteEmpNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    await session.run(
      `CALL apoc.load.json("${event.deleteUrl}") YIELD value
      UNWIND value.deleteNode as emp
      MATCH (n:EMPLOYEE {EmployeeCode: emp})
      DETACH DELETE n`);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteEmpNeo4j::::", err);
    throw internalServer(`Error in Deleting Node::::`);
  }
};