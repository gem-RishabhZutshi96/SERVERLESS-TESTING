import * as jwt from "jsonwebtoken";
import { getUserRole } from "../misc/getRole";
import { parameterStore } from "../config/commonData";
export const accessAllowed = async (event) => {
  try {
    const key =  parameterStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    let allowedFor = event.allowedFor;
    let userRole = await getUserRole(decode.email);
    if (allowedFor.includes(userRole)) {
      return {
        access: "allowed",
        userEmail: decode.email
      };
    } else {
      return {
        access: "denied",
        userEmail: decode.email
      };
    }
  } catch (err) {
    console.log(err);
  }
};
export const accessDeniedToSource = async(event) => {
  try {
    let source = null;
    const key =  parameterStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    if(!event.eventObject.path.source){
      source = event.eventObject.query.source;
    } else {
      source = event.eventObject.path.source || event.eventObject.pathParameters.source;
    }
    let role = await getUserRole(decode.email);
    if ((event.deniedSources).includes(source)) {
      if((event.deniedRoles).includes(role)){
        return {
          access: "denied",
          userEmail: decode.email
        };
      }
    }
  } catch (err) {
    console.log(err);
  }
};
export const accessAllowedToSource = async (event) => {
  try {
    let source = null;
    const key =  parameterStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    if(!event.eventObject.path.source){
      source = event.eventObject.query.source;
    } else {
      source = event.eventObject.path.source || event.eventObject.pathParameters.source;
    }
    let role = await getUserRole(decode.email);
    if (event.allowedSources.includes(source)) {
      if(event.allowedRoles.includes(role)){
        return {
          access: "allowed",
          userEmail: decode.email
        };
      }
    }
  } catch (err) {
    console.log(err);
  }
};
