import {
    errorLogger,
    infoLogger
} from "../utils/log-helper";
import {
    createOrUpdateEmpNeo4j,
    deleteEmpNeo4j
} from "./actionHandler/empNeo4j";
import {
    createOrUpdateProjectNeo4j,
    deleteProjectNeo4j
} from "./actionHandler/projectNeo4j";
import {
    createOrUpdateTeamNeo4j,
    deleteTeamNeo4j
} from "./actionHandler/teamNeo4j";
export async function main(event) {
    try {
        let result = await processEvent(event);
        return result;
    } catch (err) {
        errorLogger("orgchart-neo4jHandler", err, "Error in db Main");
        return err;
    }
}
const processEvent = async (event) => {
    infoLogger(
        "orgchart-neo4jHandler",
        event,
        "process event called with event"
    );
    switch (event.actionType) {
        case "createOrUpdateProjectNeo4j":
            return createOrUpdateProjectNeo4j(event);
        case "deleteProjectNeo4j":
            return deleteProjectNeo4j(event);
        case "createOrUpdateTeamNeo4j":
            return createOrUpdateTeamNeo4j(event);
        case "deleteTeamNeo4j":
            return deleteTeamNeo4j(event);
        case "createOrUpdateEmpNeo4j":
            return createOrUpdateEmpNeo4j(event);
        case "deleteEmpNeo4j":
            return deleteEmpNeo4j(event);
    }
};