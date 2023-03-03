import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateEmpNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateEmpNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      if(event.createArray.length >= 1){
        await session.run(`
        UNWIND $createArray as emp
        CALL apoc.create.node(['EMPLOYEE'], emp) YIELD node
        RETURN node
      `,{createArray: event.createArray});
      }
      if(event.updateNode.length >= 1){
        await session.run(`
        UNWIND $updateNode as emps
        WITH emps
        MATCH (a:EMPLOYEE{EmployeeCode:emps.EmployeeCode})
        WITH a, emps
        SET a.name = emps.EmployeeName, 
            a.Designation = emps.Designation, 
            a.ImagePath = emps.ImagePath,
            a.ManagerCode = emps.ManagerCode,
            a.ECTech = emps.ECTech,
            a.DCTech = emps.DCTech,
            a.isActive = true,
            a.updatedAt = emps.updatedAt,
            a.updatedBy = emps.updatedBy
      `,{updateNode: event.updateNode});
      }
    } catch (err) {
      errorLogger("createOrUpdateEmpNeo4j ", err);
      throw internalServer(`Error in Creating or Updating Node `);
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
      MATCH (n:EMPLOYEE {EmployeeCode: emp})-[r]-()
      SET n.isActive = false,
          n.updatedAt = "${event.node.updatedAt}",
          n.updatedBy = "${event.node.updatedBy}",
          r.isActive = false,
          r.endDate = "${event.node.updatedAt}"`);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteEmpNeo4j ", err);
    throw internalServer(`Error in Deleting Node `);
  }
};