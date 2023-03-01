import AWS from 'aws-sdk';
import { parameterStore } from "../config/commonData";
export const s3SignedUrlForDocuments = async(s3Case, data) => {
    const s3 = new AWS.S3();
    const orgchartS3Bucket = parameterStore[process.env.stage].s3Params.orgchartS3Bucket;
    s3.config.update({
        accessKeyId: parameterStore[process.env.stage].s3Params.accessKeyId,
        secretAccessKey: parameterStore[process.env.stage].s3Params.secretAccessKey,
        region: parameterStore[process.env.stage].s3Params.region,
        signatureVersion: parameterStore[process.env.stage].s3Params.signatureVersion
    });
    switch (s3Case) {
        case 'getSignedUrlForUpload': {
            let { type, key, officialID, name, pimcoId } = data;
            let fileName = '';
            if (type == 'application/pdf') {
                let timestamp = new Date().toISOString();
                if (pimcoId) {
                    fileName = key.split('/').join('') + '_' + pimcoId + '_' + timestamp + '.pdf';
                } else {
                    fileName = key.split('/').join('') + '_' + timestamp + '.pdf';
                }
            }
            if (type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                let timestamp = new Date().toISOString();
                if (pimcoId) {
                    fileName = key.split('/').join('') + '_' + pimcoId + '_' + timestamp + '.docx';
                } else {
                    fileName = key.split('/').join('') + '_' + timestamp + '.docx';
                }
            }
            if (type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                let timestamp = new Date().toISOString();
                fileName = key.split('/').join('') + '_' + timestamp + '.xlsx';
            }
            let Name = toPascalCase(name);
            let s3Key;
            if (type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                s3Key = 'hierarchyExcels' + '/' + fileName;
            } else {
                s3Key = officialID + '-' + Name + '/' + fileName;
            }
            let params = {
                Bucket: orgchartS3Bucket,
                Key: s3Key,
                Expires: 3000,
                ContentType: type,
                ACL: 'public-read'
            };
            try {
                let response = await s3.getSignedUrl('putObject', params);
                return {
                    postUrl: response,
                    getUrl: response.split("?"),
                    path: s3Key,
                    success: true
                };
            } catch (error) {
                throw error;
            }
            break;
        }
        case 'getSignedUrlForRetrieve': {
            let { key } = data;
            let params = {
                Bucket: orgchartS3Bucket,
                Key: key
            };
            try {
                let response = await s3.getSignedUrl('getObject', params);
                return {
                    getUrl: response.split("?")[0],
                    success: true
                };
            } catch (error) {
                throw error;
            }
            break;
        }
        case 'deleteDoc': {
            let empObject = data;
            let key = empObject.Documents.path;
            let params = {
                Bucket: orgchartS3Bucket,
                Key: key
            };
            try {
                let response = await s3.deleteObject(params);
                return response;
            } catch (error) {
                throw error;
            }
            break;
        }
        case 'getSignedUrlForImageUpload': {
            let { type, key, officialID, name, pimcoId } = data;
            let fileName = '';
            let timestamp = new Date().toISOString();
            if (pimcoId) {
                fileName = key.split('/').join('') + '_' + pimcoId + '_' + timestamp + '.jpg';
            } else {
                fileName = key.split('/').join('') + '_' + timestamp + '.jpg';
            }
            let Name = toPascalCase(name);
            let s3Key = officialID + '-' + Name + '/' + fileName;
            let params = {
                Bucket: orgchartS3Bucket,
                Key: s3Key,
                Expires: 3000,
                ContentType: type,
                ACL: 'public-read'
            };
            try {
                let response = await s3.getSignedUrl('putObject', params);
                return {
                    postUrl: response,
                    getUrl: response.split("?"),
                    path: s3Key,
                    success: true
                };
            } catch (error) {
                throw error;
            }
            break;
        }
    }
};
function toPascalCase(string) {
    return `${string}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w+)/, 'g'),
            ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
        )
        .replace(new RegExp(/\s/, 'g'), '')
        .replace(new RegExp(/\w/), s => s.toUpperCase());
}