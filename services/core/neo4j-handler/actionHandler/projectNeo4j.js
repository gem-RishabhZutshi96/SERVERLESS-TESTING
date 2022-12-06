import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import cryptoRandomString from 'crypto-random-string';
import { parameterStore } from "../../../utilities/config/commonData";
import cryptoRandomString from 'crypto-random-string';
import { internalServer, successResponse } from "../../../utilities/response";
export const createOrUpdateProjectNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateProjectNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:PROJECT {projectId:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      if(!exist) {
        const createNode = await session.run(`
          CREATE
          (${cryptoRandomString({length: 5, type: 'base64'})}:PROJECT{projectId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
        `);
        return successResponse('Node Created Successfully');
      } else {
        await session.run(`
          MERGE
          (${cryptoRandomString({length: 5, type: 'base64'})}:PROJECT{projectId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
        `);
        return successResponse('Node Updated Successfully');
      }
    } catch (err) {
      errorLogger("createOrUpdateProjectNeo4j::::", err);
      throw internalServer(`Error in Creating or Updating Node::::`, err);
    }
};

export const deleteProjectNeo4j = async (event) => {
  try {
    devLogger("deleteProjectNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const deleteNode = await session.run(
      `MATCH (n:PROJECT {projectId:"${event.node.id}"})
      DETACH DELETE n
    `);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteProjectNeo4j::::",err);
    throw internalServer(`Error in Deleting Node::::`, err);
  }
};