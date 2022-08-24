export const urlStore = {
    dev: {
        MONGODB_URI : "mongodb+srv://manish:pNLBpBDlEE35sjr4@cluster0.17vcdlq.mongodb.net/?retryWrites=true&w=majority",
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
        }
    },
    production: {
    },
};
