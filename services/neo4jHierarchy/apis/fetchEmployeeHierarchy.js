import { badRequest } from "../../utilities/response/index";
import { makeDBConnection } from "../../utilities/db/mongo";
import { devLogger, errorLogger } from "../utils/log-helper";
import { internalServer } from "../../utilities/response";
import { viewModel } from "../../utilities/dbModels/view";
import { main } from "../neo4j-handler";
export const fetchEmployeeHierarchy = async(event) => {
  try {
      devLogger("fetchEmployeeHierarchy", event, "event");
      let source = event.path.source || event.pathParameters.source;
      await makeDBConnection();
      const sourceViews = await viewModel.find({ 'name': { '$regex': source, '$options': 'i' } });
      if(sourceViews.length >= 1){
        const resp = await main({
          actionType: 'fetchHierarchy',
          relationName: sourceViews[0].relationName,
          rootId: sourceViews[0].rootId
        });
        resp.data = JSON.parse(resp.data);
        const nodes = flatten([resp.data]);
        if(nodes.length <= 1){
          let obj = {};
          Object.entries(resp.data.properties).forEach(([key, value]) => {
            Object.assign(obj, {[key]:value});
          });
          Object.assign(obj, {id: resp.data.id, labels: resp.data.labels, children:[]});
          let response = {
            success: resp.success,
            message: resp.message,
            data: {
              hierarchyData: Object.assign(obj, ),
              nodeData: [obj]
            }
          };
          return response;
        }
        let response = {
          success: resp.success,
          message: resp.message,
          data: {
            hierarchyData: resp.data,
            nodeData: nodes
          }
        };
        return response;
      } else {
        return badRequest("Invalid path parameters");
      }
    } catch(err) {
      errorLogger("fetchEmployeeHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
  }
};
const flatten = (array) => array.flatMap(({description, name, Designation, DCTech, DepartmentName, ECTech, EmailId, EmployeeCode, EmployeeName, Experience, ImagePath, Location, MobileNumber, ManagerCode, projectId, ReportingManager, teamId, children}) => [
  { description, name, Designation, DCTech, DepartmentName, ECTech, EmailId, EmployeeCode, EmployeeName, Experience, ImagePath, Location, MobileNumber, ManagerCode, projectId, ReportingManager, teamId },
  ...flatten(children || [])
]);