import { badRequest, internalServer, successResponse } from "../../utilities/response";
import { devLogger, errorLogger } from "../utils/log-helper";
import { main } from "../neo4j-handler";
import { parameterStore } from "../../utilities/config/commonData";
import { makeDBConnection } from "../../utilities/db/mongo";
import { viewModel } from "../../utilities/dbModels/view";
import moment from 'moment';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
s3.config.update({
  accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
  secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
  region: parameterStore[process.env.stage].s3Params.region,
  signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
});
export const saveViewToS3 = async (event) => {
    try {
        devLogger("saveViewToS3", event, "event");
        await makeDBConnection();
        const sourceViews = await viewModel.find({ 'relationName': { '$regex': event.relationName, '$options': 'i' } });
        if(sourceViews.length >= 1){
            const resp = await main({
            actionType: 'fetchHierarchy',
            relationName: sourceViews[0].relationName,
            rootId: sourceViews[0].rootId
            });
            resp.data = JSON.parse(resp.data);
            let buf = Buffer.from(JSON.stringify(
                {
                    'viewName': sourceViews[0].name,
                    'type': sourceViews[0].type,
                    'viewId': sourceViews[0].viewId,
                    'relationName': sourceViews[0].relationName,
                    'rootId': sourceViews[0].rootId,
                    'hierachyData': resp.data,
                }
            ));
            let timestamp = moment().format('DD-MM-YYYY_HH:mm:ss');
            let fileName = 'hierarchyJSON' + '/' + sourceViews[0].name + '__' + timestamp + '.json';
            let params = {
                Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
                Key: fileName,
                ContentType: 'application/json',
                Body: buf
            };
            let responseOfUpload;
            console.log("---- UPLODAING TO S3 ----");
            const upload = new Promise((resolve, reject) => {
                s3.upload(params, function (err, data) {
                  if (err) {
                    console.log(err, err.stack);
                    responseOfUpload = {
                      statusCode: "[400]",
                      message: "some error occured",
                      data: err,
                    };
                    reject(responseOfUpload);
                  } else {
                    responseOfUpload = {
                      statusCode: "[200]",
                      message: "JSON Uploaded",
                      data: data.Location,
                    };
                    resolve(responseOfUpload);
                  }
                });
            });
            // console.log("---- GETTING SIGNED URL FROM S3 ----");
            // let downloadURL = s3.getSignedUrl("getObject",{
            //     Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
            //     Key: fileName,
            //     Expires: 3600
            // });
            return successResponse("Current view hierarchy uploded successfully to S3");
        }
        return badRequest("Invalid relation name");
    } catch (err) {
        errorLogger("saveViewToS3 ", err);
        throw internalServer(`Error in deleting relations `);
    }
};