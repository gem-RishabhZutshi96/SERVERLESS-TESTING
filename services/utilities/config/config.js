export const urlStore = {
    dev: {
        MONGODB_URI : "mongodb://localhost:27017/orgchart-serverless",
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
            }
        },
        s3Params: {
          accessKeyId: 'AKIATR4FIY7IJPVT755G',
          secretAccessKey: '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',
          region: 'ap-south-1',
          sowBucket:'gemini-docs',
          signatureVersion:'v4'
        }
    },
    production: {
    },
};
