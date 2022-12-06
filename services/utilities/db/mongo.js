import { connect } from 'mongoose';
let connection = null;
import { parameterStore } from '../../utilities/config/commonData';
export async function makeDBConnection() {
    try {
      if (!connection) {
        connection = await connect(parameterStore[process.env.stage].MONGODB_URI, {
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