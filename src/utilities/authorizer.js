import * as jwt from "jsonwebtoken";
import { getUserRole } from "./getRole";
export const authorizer = async (event) => {
  try {
    const key =  process.env.JWT_SECRET;
    let decode = jwt.verify(event.token, key);
    let allowedFor = event.allowedFor;
    let userRole = await getUserRole(decode.email);
    if (allowedFor.includes(userRole)) {
      return "allowed";
    } else {
      return {
        Message:
          "User is not authorized to access this resource with an explicit deny",
      };
    }
  } catch (err) {
    console.log(err);
  }
};
