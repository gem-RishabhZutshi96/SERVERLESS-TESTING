export function successResponse(message, data) {
    let response = {
        success: true,
        "StatusCode": 200,
        message,
        data
     };
    return response;
}

export function badRequest(message, data) {
    let response = {
        success: false,
        "StatusCode": 400,
        message,
        data
        
    };
    return response;
}

export function forbiddenRequest(message) {
    let response = {
        success: false,
        "StatusCode": 403,
        message,
    };
    return response;
}

export function internalServer(message, data) {
    let response = {
        success: false,
        "StatusCode": 500,
        message,
        data
    };
    return response;
}
export function failResponse(message, StatusCode) {
    let response = {
        success: false,
        "StatusCode": StatusCode,
        message
    };
    return response;
}