import { info, error, devLog } from "../../utilities/logging/log";
const infoLogger = (apiMethod, data, message = "") => {
  try {
    let logObj = {
      component: "EMPLOYEE SERVICE",
      apiMethod,
      data,
      message,
    };
    info(logObj);
  } catch (err) {
    console.log("error in InfoLogger", err);
  }
};

const errorLogger = (apiMethod, data, message = "") => {
  try {
    let logObj = {
      component: "EMPLOYEE SERVICE",
      apiMethod,
      data,
      message,
    };
    error(logObj);
  } catch (err) {
    console.log("error in InfoLogger", err);
  }
};

const devLogger = (apiMethod, data, message = "") => {
  try {
    let logObj = {
      component: "EMPLOYEE SERVICE",
      apiMethod,
      data,
      message,
    };
    devLog(logObj);
  } catch (err) {
    console.log("error in InfoLogger", err);
  }
};

export { infoLogger, errorLogger, devLogger };
