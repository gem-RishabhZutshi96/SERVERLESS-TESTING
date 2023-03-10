import { makeDBConnection } from "../../../utilities/db/mongo";
import { empRoleMapModel } from "../../../utilities/dbModels/empRoleMap";
import { internalServer, successResponse, failResponse } from "../../../utilities/response/index";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { parameterStore } from "../../../utilities/config/commonData";
import * as jwt from "jsonwebtoken";
export const fetchAllMappings = async(event) => {
    try{
      devLogger("fetchAllMappings", event, "event");
      await makeDBConnection();
      let userToken = getUserToken(event);
      const key =  parameterStore[process.env.stage].JWT_SECRET;
      let auth = jwt.verify(userToken, key);
      if(auth.email){
        const obj = await empRoleMapModel.find();
        if(obj.length < 1){
          return failResponse('Mappings Not Found', 404);
        }
        return successResponse('Mappings Fetched Successfully', obj);
      } else return auth;
    } catch(err) {
      errorLogger("fetchAllMappings", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};