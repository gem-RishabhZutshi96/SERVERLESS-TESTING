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
          let obj = {
            "id": resp.data.id,
            "type": resp.data.type,
            "labels": resp.data.labels,
            "Designation": resp.data.properties.Designation,
            "ManagerCode": resp.data.properties.ManagerCode,
            "EmployeeCode": resp.data.properties.EmployeeCode,
            "ImagePath": resp.data.properties.ImagePath,
            "EmployeeName": resp.data.properties.EmployeeName
          };
          let response = {
            success: resp.success,
            message: resp.message,
            data: {
              hierarchyData: Object.assign(obj, {"children":[]}),
              nodeData: flatten([obj])
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
      console.log(err);
      errorLogger("fetchEmployeeHierarchy", err, "Error db call");
      return internalServer(`Error in DB `);
  }
};
const flatten = (array) => array.flatMap(({Designation, ManagerCode, EmployeeCode, EmployeeName, ImagePath, children}) => [
  { Designation, ManagerCode, EmployeeCode, EmployeeName, ImagePath },
  ...flatten(children || [])
]);