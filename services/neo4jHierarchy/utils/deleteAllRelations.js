import { makeNeo4jDBConnection } from "../../utilities/db/neo4j";
import { parameterStore } from "../../utilities/config/commonData";
import { badRequest, internalServer, successResponse } from "../../utilities/response";
import { devLogger, errorLogger } from "../utils/log-helper";
export const deleteAllRelationsForView = async (event) => {
    try {
        devLogger("deleteAllRelationsForView", event, "event");
        const { database } = parameterStore[process.env.stage].NEO4J;
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        const checkForValidRel = await session.executeRead(async tx => {
            const result = await tx.run(`
                MATCH ()-[r]->() WHERE TYPE(r) CONTAINS $relN
                RETURN r
            `,{relN: event.relationName});
            return result.records.map(record => record.get('r'));
        });
        if(checkForValidRel.length < 1){
            return badRequest("Given relation does not exist in NEO4J DB");
        }
        await session.run(`
          MATCH ()-[r:${event.relationName}]->()
          DELETE r
        `);
        return successResponse("All relations deleted successfully");
    } catch (err) {
        errorLogger("deleteAllRelationsForView ", err);
        throw internalServer(`Error in deleting relations `);
    }
};