let defaultUser = {
    uuid: null,
    email: null,
    password: null,
    age: null,
    weight: null,
    admin: false,
    paid: false,
    apiToken: null,
    fitbitToken: null,
    fitbitRefreshToken: null
};

let user = function user(userDetails) {
    if (!userDetails || Array.isArray(userDetails) || typeof userDetails !== 'object') {
        return false;
    }

    return Object.assign(Object.create(defaultUser), userDetails);
};

export default user;