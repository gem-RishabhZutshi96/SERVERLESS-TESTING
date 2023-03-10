import * as path from 'path';
export const parameterStore = {
    dev: {
        MONGODB_URI : "mongodb://localhost:27017/orgchart-serverless",
        NEO4J: {
          URL: "bolt://localhost:7687",
          db_username: "neo4j",
          db_password: "neo4j",
          database: "neo4j",
        },
        rootDirectory: path.join(__dirname, '..', '..'),
        JWT_SECRET : "anydemosecret",
        LOG_LEVEL : "debug",
        msalServiceUrl: 'https://graph.microsoft.com/v1.0/me',
        domain: process.env.DOMAIN || 'http://localhost:3000',
        sourceIds: {
            pimco: {
              id: 'clientMappingID',
              parentId: 'OrgManagerID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ],
            },
            gemini: {
              id: 'officialID',
              parentId: 'OfficialParentID',
              searchFields: [
                'Name',
                'OfficialDesignation',
                'Email',
                'MobileNumber',
                'OfficialTeam',
                'OfficeLocation',
              ],
            },
            team: {
              id: 'clientMappingID',
              parentId: 'ParentTeamID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ],
            },
            service: {
              id: 'officialID',
              parentId: 'ParentServiceManagerID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ],
            },
            project: {
              id: 'EmployeeProjectId',
              parentId: 'ProjectWiseViewID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ],
            },
            john: {
              id: 'clientMappingID',
              parentId: 'HierarchyView2ID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ]
            },
            prodDev: {
              id: 'officialID',
              parentId: 'HierarchyView3ID',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ]
            },
            tech: {
              id: 'officialID',
              parentId: 'TechView',
              searchFields: [
                'Name',
                'Role',
                'ClientEmail',
                'MobileNumber',
                'ClientTeam',
              ]
            },
            ec: {
              id: "officialID",
              parentId: "ECViewID",
              searchFields: [
                "Name",
                "Role",
                "ClientEmail",
                "MobileNumber",
                "ClientTeam",
              ],
            },
            hrbp: {
              id: "officialID",
              parentId: "HRBPViewID",
              searchFields: [
                "Name",
                "Role",
                "ClientEmail",
                "MobileNumber",
                "ClientTeam",
              ],
            },
            dc: {
              id: "officialID",
              parentId: "DCViewID",
              searchFields: [
                "Name",
                "Role",
                "ClientEmail",
                "MobileNumber",
                "ClientTeam",
              ],
            },
        },
        s3Params: {
          accessKeyId: 'AKIATR4FIY7IJPVT755G',
          secretAccessKey: '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',
          region: 'ap-south-1',
          orgchartS3Bucket:'gemini-docs',
          signatureVersion:'v4'
        },
        misapi: {
          fetchImages: `https://misapi.geminisolutions.com/api/Pimco/GeminiUserProfileData`,
          authentication: `https://misapi.geminisolutions.com/api/Authenticate/Authenticate`,
          uri: "https://misapi.geminisolutions.com/api/External/OrgDetails?key=Ks5GSWiV2tZjuF87rSIJgQ==&token=9849AE58-1CF2-4D97-8F1A-5B4D7A52BAA5",
        },
    },
    production: {
    },
};
