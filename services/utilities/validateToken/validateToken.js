import JWT from "jsonwebtoken";
import { urlStore } from "../config/config";
const key = urlStore[process.env.stage].JWT_SECRET;
export const main = (event) => {
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
const generatePolicy = (effect, action, resource) => {
    let policy = {};
    policy.Version = "2012-10-17";
    policy.Statement = [];
    let statementObject = {};
    statementObject.Effect = effect;
    statementObject.Action = action;
    statementObject.Resource = resource;
    policy.Statement.push(statementObject);
    return policy;
};