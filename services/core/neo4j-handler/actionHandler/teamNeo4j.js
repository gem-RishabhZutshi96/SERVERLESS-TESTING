import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import cryptoRandomString from 'crypto-random-string';
export const addTeamNeo4j = async (event) => {
    try {
      devLogger("addTeamNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:${event.label} {${event.filter}:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      if(!exist){
        const createNode = await session.run(`
          CREATE
          (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{teamId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
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
        "addTeamNeo4j",
        err,
        "Error in DB aggregate query for collection -> TaxSavingOption"
      );
      throw internalServer(`Error in Fetching Tax Saving Options Data `, err);
    }
};

export const deleteTeamNeo4j = async (event) => {
  try {
    devLogger("deleteTeamNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const deleteNode = await session.run(
      `MATCH (n:${event.label} {teamId:"${event.node.id}"})
      DETACH DELETE n`);
  } catch (err) {
    errorLogger(
      "deleteTeamNeo4j",
      err,
      "Error in DB aggregate query for collection -> TaxSavingOption"
    );
    throw internalServer(`Error in Fetching Tax Saving Options Data `, err);
  }
};

export const updateTeamNeo4j = async (event) => {
  try {
    devLogger("getData", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    const exist = await session.run(
      `OPTIONAL MATCH (n:${event.label} {${event.filter}:"${event.node.id}"})
      RETURN n IS NOT NULL AS Predicate`);
    if(exist){
      const createNode = await session.run(`
        CREATE
        (${cryptoRandomString({length: 5, type: 'base64'})}:${event.label}{teamId:"${event.node.id}", name:"${event.node.name}", desciption:"${event.node.description}"})
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