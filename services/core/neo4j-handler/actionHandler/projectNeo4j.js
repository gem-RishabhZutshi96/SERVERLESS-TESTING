import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import cryptoRandomString from 'crypto-random-string';
export const addProjectNeo4j = async (event) => {
    try {
      devLogger("addProjectNeo4j", event, "event");
      const { database } = dataStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:${event.label} {${event.filter}:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      if(!exist){
        const createNode = await session.run(`
          CREATE
          (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{projectId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
        `);
      } else {
        return {
          statusCode: "[404]",
          message: "Tax Saving Options Data Not Found",
          data: result,
        };
      }
    } catch (err) {
      errorLogger(
        "addProjectNeo4j",
        err,
        "Error in DB aggregate query for collection -> TaxSavingOption"
      );
      throw internalServer(`Error in Fetching Tax Saving Options Data `, err);
    }
};

export const deleteProjectNeo4j = async (event) => {
  try {
    devLogger("deleteProjectNeo4j", event, "event");
    const { database } = dataStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const deleteNode = await session.run(
      `MATCH (n:${event.label} {projectId:"${event.node.id}"})
      DETACH DELETE n`);
  } catch (err) {
    errorLogger(
      "deleteProjectNeo4j",
      err,
      "Error in DB aggregate query for collection -> TaxSavingOption"
    );
    throw internalServer(`Error in Fetching Tax Saving Options Data `, err);
  }
};

export const updateProjectNeo4j = async (event) => {
  try {
    devLogger("getData", event, "event");
    const { database } = dataStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const exist = await session.run(
      `OPTIONAL MATCH (n:${event.label} {${event.filter}:"${event.node.id}"})
      RETURN n IS NOT NULL AS Predicate`);
    if(exist){
      const createNode = await session.run(`
        CREATE
        (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{projectId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
      `);
    } 
  } catch (err) {
    errorLogger(
      "getData",
      err,
      "Error in DB aggregate query for collection -> TaxSavingOption"
    );
    throw internalServer(`Error in Fetching Tax Saving Options Data `, err);
  }
};