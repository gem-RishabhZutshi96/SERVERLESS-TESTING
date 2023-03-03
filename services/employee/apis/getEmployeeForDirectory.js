import { parameterStore } from "../../utilities/config/commonData";
import { internalServer } from "../../utilities/response/index";
import { accessDeniedToSource } from "../../utilities/validateToken/authorizer";
import { EmployeeModel } from  "../../utilities/dbModels/employee";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { resolveURL } from "../../utilities/resolveURL/resolve";
import { devLogger, errorLogger } from "../utils/log-helper";
export const getEmployeeForDirectory = async(event) => {
    try{
      devLogger("getEmployeeForDirectory", event, "event");
      let userToken = null;
      userToken = getUserToken(event);
      let authQuery={
        eventObject: event,
        token: userToken,
        deniedRoles:['pimco'],
        deniedSources:['gemini']
      };
      const auth = await accessDeniedToSource(authQuery);
      if( auth.success){
        let pageNo = String(event.query.pageNo);
        let perPage = String(event.query.perPage);
        let pattern = String(event.query.pattern);
        let sort = String(event.query.sort);
        let source = String(event.query.source);
        const response = await getEmployeeForDirectoryResponse({pageNo,perPage,pattern,source,sort});
        return response;
      } else {
        return auth;
      }
    } catch(err) {
      errorLogger("getEmployeeForDirectory", err, "Error db call");
      return internalServer(`Error in DB `);
    }
};
async function getEmployeeForDirectoryResponse(query) {
    console.log(`Find employees for ${query.source} directory`);
    const { id, parentId, searchFields } = parameterStore[process.env.stage].sourceIds[query.source];
    const limit = +query.perPage;
    const skip = (+query.pageNo - 1) * limit;
    const findQuery = {
        [id]: { $exists: true, $ne: null },
        [parentId]: { $exists: true, $ne: null },
    };
    const sort = query.sort || { Name: 1 };
    if (query.pattern) {
      findQuery['$or'] = searchFields.map(s => ({
        [s]: { $regex: query.pattern, $options: 'i' },
      }));
    }
    const [employees, count] = await Promise.all([
      EmployeeModel.find(findQuery).sort(sort).skip(skip).limit(limit).lean(),
      EmployeeModel.countDocuments(findQuery),
    ]);
    employees.forEach(emp => {
      emp.Documents =
        emp.Documents &&
        emp.Documents.map(doc => {
          return doc;
        });
      if (emp.Image && !emp.Image.startsWith('http'))
        emp.Image = resolveURL(parameterStore[process.env.stage].domain, emp.Image);
    });
    return {
      data: {
        employees,
        count,
      },
      success: true,
      message: 'Employees fetched',
    };
}