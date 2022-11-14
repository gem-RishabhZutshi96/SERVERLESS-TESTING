import { urlStore } from "../../utilities/config/config";
import { internalServer, successResponse, forbiddenRequest } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { EmployeeModel } from  "../../utilities/dbModels/employee";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { resolveURL } from "../../utilities/resolveURL/resolve";
export const getEmployeeForDirectoryById = async(event) => {
    try{
      let userToken = null;
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor:['management_su', 'hr_su']
      };
      let auth= await accessAllowed(authQuery);
      if(auth!=="allowed"){
        return forbiddenRequest("❌❌User is not allowed to access the data");
      }
      let employeeID = event.path.id;
      const response = await getEmployeeForDirectoryFromId( employeeID );
      return response;
    } catch(err){
        console.log(err);
        throw internalServer(`Error in DB`, err);
    }
};
async function getEmployeeForDirectoryFromId(_id) {
    const employee= await EmployeeModel.findById(_id).lean();
    if (employee.Image && !employee.Image.startsWith('http')) {
      employee.Image = resolveURL(urlStore[process.env.stage].domain, employee.Image);
    }
    return successResponse( 'Employee Fetched', { employee });
};