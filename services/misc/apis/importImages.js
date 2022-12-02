import { makeDBConnection } from "../../utilities/db/mongo";
import { EmployeeModel } from "../../utilities/dbModels/employee";
import { internalServer } from "../../utilities/response/index";
import { accessAllowed } from "../../utilities/validateToken/authorizer";
import { getUserToken } from "../../utilities/validateToken/getUserToken";
import { dataStore } from "../../utilities/config/commonData";
import { devLogger, errorLogger } from "../utils/log-helper";
import axios from 'axios';
export const importImages = async(event) => {
    try {
      devLogger("importImages", event, "event");
      let userToken =null;
      await makeDBConnection();
      userToken = getUserToken(event);
      let authQuery={
        token: userToken,
        allowedFor: ['management_su', 'hr_su']
      };
      let auth= await accessAllowed(authQuery);
      if(auth!=="allowed"){
        return auth;
      }
      const data = (await axios.get(`${dataStore[process.env.stage].misapi.fetchImages}`)).data.Result;
      EmployeeModel.collection.initializeOrderedBulkOp();
      data.forEach(async d => {
        let dataObject = await EmployeeModel.findOne({
          officialID: { $regex: d.EmployeeCode, $options: 'i' },
        });
        if (dataObject) {
          await EmployeeModel.updateMany(
            { officialID: { $regex: d.EmployeeCode, $options: 'i' } },
            {
              $set: {
                Image: d.ImagePath,
              },
            }
          );
        } else {
          await EmployeeModel.updateMany(
            { officialID: { $regex: d.EmployeeCode, $options: 'i' } },
            {
              $set: {
                Image: d.ImagePath,
              },
            }
          );
        }
      });
      let response = {
        success:true,
        message:'Images Updated Successfully'
      };
      return response;
    } catch(err) {
      errorLogger("importImages", err, "Error db call");
      throw internalServer(`Error in fetching images from MIS `, err);
    }
};