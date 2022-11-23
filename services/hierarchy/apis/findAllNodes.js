import { makeNeo4jDBConnection } from "../../utilities/db/neo4jdatabase";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { urlStore } from '../../utilities/config/config';
export const findAllNodes = async(event) => {
  try {
      const { database } = urlStore[process.env.stage].NEO4J;
      devLogger("findAllNodes", event, "event");
      let driver = await makeNeo4jDBConnection();
      let session = driver.session({ database });
      const result = await session.run(`
        MATCH N
        RETURN N`
      );
      let response = {
          success: true,
          message: "Nodes fetched successfully",
          data: result.records.map(i => i.get('N').properties)
      };
      return response;
    } catch(err) {
      errorLogger("findAllNodes", err, "Error db call");
      throw internalServer(`Error in DB `, err);
  }
};