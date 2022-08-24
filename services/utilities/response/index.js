export function successResponse(message, data) {
    let response = {
        success: true,
        message,
        data
     };
    return response;
}

export function badRequest(message, data) {
    let response = {
        message,
        data,
        success: false
    };
    return response;
}

export function forbiddenRequest(message, data) {
    let response = {
        message,
        data,
        success: false
    };
    return response;
}

export function internalServer(message, data) {
    let response = {
        success: false,
        message,
        data,
    };
    return response;
}
export function failResponse(message, data) {
    let response = {
        success: false,
        message,
        data
    };
    return response;
}