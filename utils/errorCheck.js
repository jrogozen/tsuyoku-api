import { errors } from '../constants';

let errorCheck = function errorCheck(obj, existingErr) {
    if (!obj || Array.isArray(obj) || typeof obj !== 'object') return false;

    if (existingErr) {
        return existingErr;
    }

    // check for error type
    if (obj.name === 'Error' && obj.message) {
        return obj;
    }

    if (obj.name === 'MongoError') {
        return new Error(errors.dbError);
    }

    return null;
};

export default errorCheck;