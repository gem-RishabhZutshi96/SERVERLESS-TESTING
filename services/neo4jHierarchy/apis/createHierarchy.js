import { makeDBConnection } from "../../utilities/db/mongo";
import { internalServer, badRequest, failResponse } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { devLogger, errorLogger } from "../utils/log-helper";
import { readExcelData } from "../utils/importExcel";
import { main } from "../neo4j-handler/index";
import { parameterStore } from "../../utilities/config/commonData";
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
export const createHierarchy = async(event) => {
    try{
      devLogger("createHierarchy", event, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su']
      };
      let auth= await accessAllowed(authQuery);
      if( auth.access !=="allowed"){
        return auth;
      }
      const { key } = event.body;
      if(!key){
        return badRequest('Missing Query Parameters');
      }
      s3.config.update({
          accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
          secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
          region: parameterStore[process.env.stage].s3Params.region,
          signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
      });
      const params = {
        Bucket: parameterStore[process.env.stage].s3Params.orgchartS3Bucket,
        Key: key,
      };
      const file = await s3.getObject(params).promise();
      if(!file){
        return badRequest('File not found');
      }
      const result = await readExcelData(file);
      if(result.length < 1){
        return failResponse('Excel File is Empty');
      }
      const resp = await main({
        actionType: 'createHierarchyForExcel',
        nodeData: result,
        relationName: event.path.relation
      });
      return resp;
    } catch(err) {
      errorLogger("createHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};