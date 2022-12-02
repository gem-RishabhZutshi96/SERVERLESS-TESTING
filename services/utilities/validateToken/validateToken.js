import JWT from "jsonwebtoken";
import { dataStore } from "../config/config";
const key = dataStore[process.env.stage].JWT_SECRET;
export const main = async (event) => {
    try {
        let userToken = event.authorizationToken ? event.authorizationToken.split(' ')[1] : null;
        if (!userToken) {
            return "Unauthorised";
        } else {
            let decode = JWT.verify(userToken, key);
            return {
                principalId: decode.email,
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