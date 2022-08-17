import { connect } from 'mongoose';
require('dotenv').config();
let connection = null;
export async function makeDBConnection() {
    try {
      if (!connection) {
        connection = await connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false 
        });
      }
      console.log("✌✌✌✌ Database loaded and connected sucessfully");
      return connection;
    } catch (err) {
      console.log("Error in makeDbConnection", err);
    }
}