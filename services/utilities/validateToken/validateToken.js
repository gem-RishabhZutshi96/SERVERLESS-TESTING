import JWT from "jsonwebtoken";
import { urlStore } from "../config/config";
const key = urlStore[process.env.stage].JWT_SECRET;
export const main = async (event) => {
    try {
        if (!event.authorizationToken) {
            return "Unauthorised";
        } else {
            let token = event.authorizationToken;
            let decode = JWT.verify(token, key);
            return decode;
        }
    } catch (err) {
        return err;
    }
};