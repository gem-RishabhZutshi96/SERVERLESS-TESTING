import {
    makeNeo4jDBConnection
} from "../../../utilities/db/neo4j";
import { parameterStore } from "../../../utilities/config/commonData";
import { internalServer, successResponse } from "../../../utilities/response";
import { devLogger, errorLogger } from "../../utils/log-helper";
export const createOrUpdateProjectNeo4j = async (event) => {
    try {
      devLogger("createOrUpdateProjectNeo4j", event, "event");
      const { database } = parameterStore[process.env.stage].NEO4J;
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const exist = await session.run(
        `OPTIONAL MATCH (n:PROJECT {projectId:"${event.node.id}"})
        RETURN n IS NOT NULL AS Predicate`);
      const isProjectNode = exist.records.map(i => i.get('Predicate'));
      if(isProjectNode[0] !== true) {
        await session.run(`
          CREATE (n:PROJECT {projectId:"${event.node.id}", name:"${event.node.name}", description:"${event.node.description}"})
          RETURN n
        `);
        return successResponse('Node Created Successfully');
      } else {
        await session.run(`
        MATCH (n:PROJECT {projectId:"${event.node.id}"})
        WITH n
        SET n.name="${event.node.name}",n.description="${event.node.description}"
        RETURN n
        `);
        return successResponse('Node Updated Successfully');
      }
    } catch (err) {
      errorLogger("createOrUpdateProjectNeo4j ", err);
      throw internalServer(`Error in Creating or Updating Node `);
    }
};

export const deleteProjectNeo4j = async (event) => {
  try {
    devLogger("deleteProjectNeo4j", event, "event");
    const { database } = parameterStore[process.env.stage].NEO4J;
    let driver = await makeNeo4jDBConnection();
    let session = driver.session({ database });
    await session.run(
      `MATCH (n:PROJECT{projectId:"${event.node.id}"})
      DETACH DELETE n
    `);
    return successResponse('Node Deleted Successfully');
  } catch (err) {
    errorLogger("deleteProjectNeo4j ",err);
    throw internalServer(`Error in Deleting Node `);
  }
};