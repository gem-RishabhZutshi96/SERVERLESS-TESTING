import { dataStore } from '../../utilities/config/commonData';
const neo4j = require('neo4j-driver');
let driver = null;
export async function makeNeo4jDBConnection() {
    try {
        const { URL, db_username, db_password} = dataStore[process.env.stage].NEO4J;
        if (!driver) {
            driver = neo4j.driver(URL, neo4j.auth.basic(db_username, db_password));
        }
        return driver;
    } catch (err) {
      console.log("Error in makeNeo4jDbConnection", err);
    }
}