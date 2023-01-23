import {
    errorLogger,
    infoLogger
} from "../utils/log-helper";
import {
    createHierarchyForExcel,
    fetchHierarchy
} from "./actionHandler/hierarchyNeo4j";
import {
    deleteNode,
    addNode
} from "./actionHandler/nodesNeo4j";
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
        case "createHierarchyForExcel":
            return createHierarchyForExcel(event);
        case "fetchHierarchy":
            return fetchHierarchy(event);
        case "addNode":
            return addNode(event);
        case "deleteNode":
            return deleteNode(event);
    }
};