import { internalServer, badRequest } from "../../utilities/response/index";
import axios from 'axios';
import { getUserRole } from "../../utilities/misc/getRole";
import * as jwt from 'jsonwebtoken';
import { urlStore } from '../../utilities/config/config';
import { devLogger, errorLogger } from "../utils/log-helper";
export const verifyLogin = async(event) => {
    try {
      devLogger("verifyLogin", event, "event");
      if(!(event.body.accessToken || event.body.email)){
        return badRequest("🤔🤔 Missing body parameters");
      } else {
        const { accessToken, email } = event.body;
        const response = await verifyUser(accessToken, email);
        return response;
      }
    } catch(err) {
      errorLogger("verifyLogin", err, "Error db call");
      throw internalServer(`Error in DB `, err);
    }
};

/**
 * Verify MSAl access token through function call and compare email of logged in user and user
 * email from graph API
 * @param  token     MSAL access token
 * @param  msalMail  User email recieved from SSO object
 */
async function verifyUser(token, msalMail) {
    const { email, success } = await sendMicrosoftAuthenticationRequest(token);
    if (success && (email === msalMail)) {
      const token = await generateToken(email);
      const role = await getUserRole(email);
      return {
        statusCode:200,
        data: { token, role },
        success: true,
        message: '😎😎 Verification successful',
      };
    } else {
      throw new Error('Invalid user');
    }
};

  /**
 * Verify MSAl access token through graph API
 * @param  token MSAL access token
 */
async function sendMicrosoftAuthenticationRequest(token) {
    const msalReqObj = {
      method: 'get',
      url: urlStore[process.env.stage].msalServiceUrl,
      headers: { 'Authorization': token }
    };
    let res = await axios(msalReqObj);
    if (res.data.error)
      return {
        success: false,
        email: null,
        error: res.data.error,
      };
    else
      return {
        success: true,
        email: res.data.mail,
        error: null
      };
};

async function generateToken(email) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign(
      {
        email: email,
        exp: exp.getTime() / 1000,
      },
      urlStore[process.env.stage].JWT_SECRET
    );
  }