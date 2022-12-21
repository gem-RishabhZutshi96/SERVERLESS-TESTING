import { makeDBConnection } from "../../../utilities/db/mongo";
import { internalServer, successResponse } from "../../../utilities/response/index";
import { accessAllowed } from "../../../utilities/validateToken/authorizer";
import { getUserToken } from "../../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../../utils/log-helper";
import { readExcelData } from "../../utils/importExcel";
import { main } from "../../neo4j-handler/index";
const { parse } = require('aws-multipart-parser');
export const createHierarchy = async(event) => {
    try{
      const filterEvent = Object.entries(event).filter(([key, value]) => key !== 'body');
      devLogger("createHierarchy", filterEvent, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su']
      };
      let auth= await accessAllowed(authQuery);
      if(auth!=="allowed"){
        return auth;
      }
      const formData = parse(event, true);
      const result = await readExcelData(formData);
      await main({
        actionType: 'createHierarchyForExcel',
        nodeData: result
      });
      return successResponse("Excel reading is completed and hierarchy is created successfully for data uploaded", []);
    } catch(err) {
      errorLogger("createHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};