export function successResponse(result) {
    let response = {
        statusCode: result.statusCode,
        message: result.message,
        count: result.count,
        data: result.data
     };
    return response;
}

export function badRequest(message, data) {
    let response = {
        message,
        data,
        statusCode: "[400]"
    };
    return response;
}

export function internalServer(message, data) {
    let response = {
        statusCode: "[500]",
        message,
        data,
    };
    return response;
}
export function failResponse(result) {
    let response = {
        statusCode: result.statusCode,
        message: result.message,
        data:result.data
    };
    return response;
}