import { dataStore } from "../config/config";
export const neo4jQueries = {
    returnAllNodes : `   
        MATCH (N)
        RETURN N;`,
    
};