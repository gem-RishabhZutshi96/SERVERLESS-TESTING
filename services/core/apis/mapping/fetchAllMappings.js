import { makeDBConnection } from "../../../utilities/db/mongo";
import { empRoleMapModel } from "../../../utilities/dbModels/empRoleMap";
import { internalServer } from "../../../utilities/response/index";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { dataStore } from "../../../utilities/config/commonData";
import * as jwt from "jsonwebtoken";
export const fetchAllMappings = async(event) => {
    try{
      devLogger("fetchAllMappings", event, "event");
      await makeDBConnection();
      let userToken = getUserToken(event);
      const key =  dataStore[process.env.stage].JWT_SECRET;
      let auth = jwt.verify(userToken, key);
      if(auth.email){
        const obj = await empRoleMapModel.find();
        if(obj.length < 1){
          return {
            success: false,
            message: 'Mappings Not Found',
          };
        }
        return {
          data: obj,
          success: true,
          message: 'Mappings Fetched Successfully',
        };
      } else return auth;
    } catch(err) {
      errorLogger("fetchAllMappings", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};