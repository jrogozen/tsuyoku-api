import { errors } from '../constants';

let createError = function createError(message, status) {
    let err;
    let errStatus = status || 500;

    if (!message) {
        return false;
    }

    err = new Error(message);
    err.status = errStatus;

    return err;
}

let errorCheck = function errorCheck(obj) {
    if (!obj || Array.isArray(obj) || typeof obj !== 'object') {
        return false;
    }

    if (obj.name === 'Error' && obj.message) {
        return obj;
    }

    if (obj.name === 'MongoError') {
        return createError(errors.dbError, 500);
    }

    return null;
};

export { errorCheck, createError };