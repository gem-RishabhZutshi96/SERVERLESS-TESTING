import { makeNeo4jDBConnection } from "../../utilities/db/neo4j";
import { parameterStore } from "../../utilities/config/commonData";
import { devLogger,errorLogger } from "./log-helper";
import { badRequest, internalServer, successResponse } from "../../utilities/response";
import * as json2xls from 'json2xls';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();
export const exportHierarchyExcel = async (event) => {
    try {
        devLogger("exportHierarchyExcel", event, "event");
        const { database } = parameterStore[process.env.stage].NEO4J;
        let driver = await makeNeo4jDBConnection();
        let session = driver.session({ database });
        let fileName = event.fileName;
        const checkForValidRel = await session.executeRead(async tx => {
            const result = await tx.run(`
                MATCH ()-[r]->() WHERE TYPE(r) = $relN
                RETURN r
            `,{relN: event.relationName});
            return result.records.map(record => record.get('r'));
        });
        if(checkForValidRel.length < 1){
            return badRequest("Given relation does not exist in NEO4J DB");
        }
        let relations = await session.executeRead(async tx => {
            const result = await tx.run(`
                MATCH ()-[r]->() WHERE r.isActive AND TYPE(r) = $relN 
                RETURN apoc.convert.toJson(r) AS output
            `,{relN: event.relationName});
            return result.records.map(record => record.get('output'));
        });
        const xls = json2xls(relations.map(rel => getHierarchyJSON(JSON.parse(rel))));
        const buffer = Buffer.from(xls, 'binary');
        s3.config.update({
            accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
            secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
            region: parameterStore[process.env.stage].s3Params.region,
            signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
        });
        await uploadToS3({
            Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
            Key: fileName,
            ContentType: 'application/vnd.ms-excel',
            Body: buffer
        });
        let downloadURL = await getS3SignedUrl({
            Bucket: parameterStore[process.env.stage].s3Params.sowBucket,
            Key: fileName,
            Expires: 3600
        });
        return successResponse("👍👍Excel Exported Successfully", downloadURL);
    } catch (e) {
        errorLogger('Error in exporting hierarchy in excel ', e);
        return internalServer(`Error in DB `);
    }
};

function getHierarchyJSON(doc) {
    let data = {};
    if(doc.start.labels[0] == "EMPLOYEE"){
        Object.assign(data,{'ID': doc.start.properties.EmployeeCode});
    } else if(doc.start.labels[0] == "PROJECT"){
        Object.assign(data,{'ID': doc.start.properties.projectId});
    } else {
        Object.assign(data,{'ID': doc.start.properties.teamId});
    }
    if(doc.end.labels[0] == "EMPLOYEE"){
        Object.assign(data,{'Parent ID': doc.end.properties.EmployeeCode});
    } else if(doc.end.labels[0] == "PROJECT"){
        Object.assign(data,{'Parent ID': doc.end.properties.projectId});
    } else {
        Object.assign(data,{'Parent ID': doc.end.properties.teamId});
    }
    return JSON.parse(
        JSON.stringify(data, (key, value) => (value == undefined ? '' : value))
    );
}

async function uploadToS3(s3Data) {
    console.log("---- UPLODAING TO S3 ----",JSON.stringify(`${s3Data.Bucket} ${s3Data.Key}`, null, 2));
    try {
      return await s3.upload(s3Data).promise();
    } catch (error) {
      console.log(error);
      return error;
    }
}


async function getS3SignedUrl(params) {
    console.log("---- GETTING SIGNED URL FROM S3 ----", JSON.stringify(params, null, 2));
    try {
      return s3.getSignedUrl("getObject", {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: params.Expires,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
}