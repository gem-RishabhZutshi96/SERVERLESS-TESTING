import { urlStore } from '../../utilities/config/config';
const neo4j = require('neo4j-driver');
let driver = null;
export async function makeNeo4jDBConnection() {
    try {
        const { URL, db_username, db_password, database} = urlStore[process.env.stage].NEO4J;
        if (!driver) {
            driver = neo4j.driver(URL, neo4j.auth.basic(db_username, db_password));
            let session = driver.session({ database });
            return session;
        }
    } catch (err) {
      console.log("Error in makeNeo4jDbConnection", err);
    }
}