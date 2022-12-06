import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import cryptoRandomString from 'crypto-random-string';
import { internalServer, successResponse } from "../../../utilities/response";
export const createOrUpdateEmpNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateEmpNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:${event.label} {${event.filter}:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      if(!exist) {
        await session.run(`
          CREATE
          (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{EmpId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
        `);
        return successResponse('Node Created Successfully');
      } else {
        await session.run(`
          MERGE
          (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{EmpId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
        `);
        return successResponse('Node Updated Successfully');
      }
    } catch (err) {
      errorLogger("createOrUpdateEmpNeo4j::::", err);
      throw internalServer(`Error in Creating or Updating Node::::`, err);
    }
};

export const deleteEmpNeo4j = async (event) => {
  try {
    devLogger("deleteEmpNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const deleteNode = await session.run(
      `MATCH (n:${event.label} {EmpId:"${event.node.id}"})
      DETACH DELETE n`);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteEmpNeo4j::::", err);
    throw internalServer(`Error in Deleting Node::::`, err);
  }
};