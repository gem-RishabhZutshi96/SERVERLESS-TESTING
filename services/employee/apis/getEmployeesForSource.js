import { parameterStore } from "../../utilities/config/commonData";
import { successResponse, internalServer, badRequest } from "../../utilities/response/index";
import { accessDeniedToSource } from "../../utilities/validateToken/authorizer";
import { EmployeeModel } from  "../../utilities/dbModels/employee";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { resolveURL } from "../../utilities/resolveURL/resolve";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getEmployeesForSource = async(event) => {
    try{
      devLogger("getEmployeesForSource", event, "event");
      let userToken = null;
      userToken = getUserToken(event);
      let authQuery={
        eventObject: event,
        token: userToken,
        deniedRoles:['pimco'],
        deniedSources:['gemini']
      };
      let source = event.path.source || event.pathParameters.source;
      const auth = await accessDeniedToSource(authQuery);
      if( auth.access !=="denied"){
        console.log(`👍👍Find employees for ${ source } hierarchy`);
        const { id, parentId } = parameterStore[process.env.stage].sourceIds[source];
        const findQueries = {
          employees: {
            [id]: { $exists: true, $ne: null },
            [parentId]: { $exists: true, $ne: null },
          },
          root: { [parentId]: 'ROOT' },
        };
        let employeesData;
        const rootData = await EmployeeModel.findOne(findQueries.root);
        if(!rootData){
          return badRequest("Root Node not found");
        }
        if (source === 'project') {
          employeesData = await EmployeeModel.find(findQueries.employees).sort('Name');
        } else {
        employeesData = (await EmployeeModel.aggregate([
          { $match: findQueries.employees },
          {
            $group: {
              _id: `$${id}`,
              all: { $first: '$$ROOT' },
            },
          },
          { $sort: { 'all.Name': 1 } },
          { $project: { _id: 0, all: 1 } },
          ])).map(v => v.all);
        }
        const employees = employeesData.map(emp => {
          const empObj = emp.toObject ? emp.toObject() : emp;
          return getEmployeeResponseObject(empObj, id, parentId);
        });
        const root = getEmployeeResponseObject(rootData.toObject(), id, parentId);
        return successResponse("Data Fetched Successfully",{ Result: { employees, root } });
      } else {
        return "❌❌User is not authorized to access this resource";
      }
    } catch(err) {
      errorLogger("getEmployeesForSource", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};
function getEmployeeResponseObject( emp, id, parentId) {
  let ImagePath;
  if (emp.Image && !emp.Image.startsWith('http')) {
    ImagePath = resolveURL(parameterStore[process.env.stage].domain, emp.Image);
  } else {
    ImagePath =
      emp.Image ||
      'https://misapi.geminisolutions.com/Images/ProfileImage/219df88d-7e4c-4b47-8266-f210411361a1.jpg?v=4.2';
  }
  return Object.assign({}, emp, {
    PimcoId: emp[id],
    PimcoParentId: emp[parentId],
    Name: emp.Name,
    Designation: emp.OfficialDesignation,
    Team: emp.ClientTeam,
    Role: emp.Role,
    ImagePath,
    PimcoTenure: emp.ClientExp,
    OnshoreManager: emp.OnShoreManagerName,
    OrgManagerName: emp.OrgManagerName,
    RoleDetail: emp.RoleDetail,
    Achievements: emp.Achievements,
    ProfileSummary: emp.ProfileSummary,
    TopNSkills: emp.Skills && emp.Skills.join(', '),
    TotalExperience: emp.TotalExp,
    FTEorOnSite: emp.FTEorOnSite,
    Billed: emp.Billed,
    OnshoreClientTeam: emp.OnshoreClientTeam,
    OnshoreClientLead: emp.OnshoreClientLead,
  });
}