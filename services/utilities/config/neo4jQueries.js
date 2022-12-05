import { dataStore } from "../config/commonData";
export const neo4jQueries = {
    returnAllNodes : `   
        MATCH (N)
        RETURN N;`,
    
};