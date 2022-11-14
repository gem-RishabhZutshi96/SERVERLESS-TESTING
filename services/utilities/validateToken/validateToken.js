import JWT from "jsonwebtoken";
import { urlStore } from "../config/config";
const key = urlStore[process.env.stage].JWT_SECRET;
export const validateToken = (event) => {
    try {
        let userToken = event.headers.Authorization ? event.headers.Authorization.split(' ')[1] : null;
        if (!userToken) {
            return "Unauthorised";
        } else {
            let decode = JWT.verify(userToken, key);
            return {
                principalId: decode.user,
                policyDocument: generatePolicy("Allow", "execute-api:Invoke", "*"),
            };
        }
    } catch (err) {
        return {
            principalId: "12345",
            policyDocument: generatePolicy("Deny", "execute-api:Invoke", "*"),
        };
    }
};