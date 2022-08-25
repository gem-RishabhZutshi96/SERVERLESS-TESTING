export const getUserToken = (event) => {
    let userToken = null;
    if (event.headers.Authorization && event.headers.Authorization.split(' ')[0] === 'Token' ||
        event.headers.Authorization && event.headers.Authorization.split(' ')[0] === 'Bearer') {
        userToken = event.headers.Authorization.split(' ')[1];
        return userToken;
    }
};
