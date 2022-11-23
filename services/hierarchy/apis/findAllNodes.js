import { makeNeo4jDBConnection } from "../../utilities/db/neo4jdatabase";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
export const findAllNodes = async(event) => {
  try {
      devLogger("findAllNodes", event, "event");
      let session = await makeNeo4jDBConnection();
      const result = await session.run(`MATCH (U) RETURN U`);
      let response = {
          success: true,
          message: "Nodes fetched successfully",
          data: result.records.map(i => i.get('U').properties)
      };
      return response;
    } catch(err) {
      errorLogger("findAllNodes", err, "Error db call");
      throw internalServer(`Error in DB `, err);
  }
};