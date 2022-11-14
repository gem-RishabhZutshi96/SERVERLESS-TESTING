import { urlStore } from "../../utilities/config/config";
import { internalServer } from "../../utilities/response/index";
import { accessDeniedToSource } from "../../utilities/validateToken/authorizer";
import { EmployeeModel } from  "../../utilities/dbModels/employee";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { resolveURL } from "../../utilities/resolveURL/resolve";
export const getEmployeeForDirectory = async(event) => {
    try{
      let userToken = null;
      userToken = getUserToken(event);
      let authQuery={
        eventObject: event,
        token: userToken,
        deniedRoles:['pimco'],
        deniedSources:['gemini']
      };
      const auth = await accessDeniedToSource(authQuery);
      if(auth!=="denied"){
        let pageNo = String(event.query.pageNo);
        let perPage = String(event.query.perPage);
        let pattern = String(event.query.pattern);
        let sort = String(event.query.sort);
        let source = String(event.query.source);
        // let query = {pageNo,perPage,pattern,source,sort };
        const response = await getEmployeeForDirectoryResponse({pageNo,perPage,pattern,source,sort});
        return response;
      } else {
        return "❌❌User is not authorized to access this resource";
      }
    } catch(err) {
      console.log(err);
      throw internalServer(`Error in DB `, err);
    }
};
async function getEmployeeForDirectoryResponse(query) {
    console.log(`👍👍Find employees for ${query.source} directory`);
    const { id, parentId, searchFields } = urlStore[process.env.stage].sourceIds[query.source];
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
      EmployeeModel
        .find(findQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      EmployeeModel.countDocuments(findQuery),
    ]);
    employees.forEach(emp => {
      emp.Documents =
        emp.Documents &&
        emp.Documents.map(doc => {
          // doc.path = resolveURL(urlStore[process.env.stage].domain, doc.path);
          return doc;
        });
      if (emp.Image && !emp.Image.startsWith('http'))
        emp.Image = resolveURL(urlStore[process.env.stage].domain, emp.Image);
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