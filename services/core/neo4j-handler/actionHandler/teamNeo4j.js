import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateTeamNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateTeamNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:TEAM {teamId:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      const isTeamNode = exist.records.map(i => i.get('Predicate'));
      if(isTeamNode[0] !== true){
        await session.run(`
          CREATE (n:TEAM{teamId:"${event.node.id}", name:"${event.node.name}", description:"${event.node.description}"})
        `);
        return successResponse('Node Created Successfully');
      } else {
        await session.run(`
          MATCH (n:TEAM {teamId:"${event.node.id}"})
          WITH n
          SET n.name="${event.node.name}",n.description="${event.node.description}"
          RETURN n
        `);
        return successResponse('Node Updated Successfully');
      }
    } catch (err) {
      errorLogger("createOrUpdateTeamNeo4j:::", err);
      throw internalServer(`Error in Creating or Updating Node::::`);
    }
};

export const deleteTeamNeo4j = async (event) => {
  try {
    devLogger("deleteTeamNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    await session.run(
      `MATCH (n:TEAM {teamId:"${event.node.id}"})
      DETACH DELETE n`);
      return successResponse('Node Updated Successfully');
  } catch (err) {
    errorLogger("deleteTeamNeo4j::::", err);
    throw internalServer(`Error in Deleting Node::::`);
  }
};