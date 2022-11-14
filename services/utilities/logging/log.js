let processEnv = process.env.stage;
const info = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) == "string") {
            console.log("string log => ", data, " at ", currentTime);
        }
        if (typeof (data) == "object") {
            data.logType = "info";
            data.dt = currentTime;
            console.log("Info log =>", JSON.stringify(data));
        }
    } catch (err) {
        console.log("Error in Logging info funcion ", JSON.stringify(err));
    }
};

const error = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) == "string") {
            console.log("string log => ", data, " at ", currentTime);
        }
        if (typeof (data) == "object") {
            data.logType = "error";
            data.dt = currentTime;
            console.log("Error log =>", JSON.stringify(data));
        }
    } catch (err) {
        console.log("Error in Logging error funcion ", JSON.stringify(err));
    }
};

const devLog = (data) => {
    try {
        let currentTime = new Date();
        if (typeof (data) == "string") {
            console.log("string log => ", data, " at ", currentTime);
        }
        if (typeof (data) == "object") {
            data.logType = `${processEnv}`;
            data.dt = currentTime;
            console.log(`${processEnv} log =>`, JSON.stringify(data));
        }
    } catch (err) {
        console.log("Error in Logging DevLog funcion ", JSON.stringify(err));
    }
};

export {
    info,
    error,
    devLog
};
