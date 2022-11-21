import * as jwt from "jsonwebtoken";
import { getUserRole } from "../misc/getRole";
import { urlStore } from "../config/config";
export const accessAllowed = async (event) => {
  try {
    const key =  urlStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    let allowedFor = event.allowedFor;
    let userRole = await getUserRole(decode.email);
    if (allowedFor.includes(userRole)) {
      return "allowed";
    } else {
      return "denied";
    }
  } catch (err) {
    console.log(err);
  }
};
export const accessDeniedToSource = async(event) => {
  try {
    let source = null;
    const key =  urlStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    if(!event.eventObject.path.source){
      source = event.eventObject.query.source;
    } else {
      source = event.eventObject.path.source || event.eventObject.pathParameters.source;
    }
    let role = await getUserRole(decode.email);
    if ((event.deniedSources).includes(source)) {
      if((event.deniedRoles).includes(role)){
        return "denied";
      }
    }
  } catch (err) {
    console.log(err);
  }
};
export const accessAllowedToSource = async (event) => {
  try {
    let source = null;
    const key =  urlStore[process.env.stage].JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    if(!event.eventObject.path.source){
      source = event.eventObject.query.source;
    } else {
      source = event.eventObject.path.source || event.eventObject.pathParameters.source;
    }
    let role = await getUserRole(decode.email);
    if (event.allowedSources.includes(source)) {
      if(event.allowedRoles.includes(role)){
        return "allowed";
      }
    }
  } catch (err) {
    console.log(err);
  }
};
