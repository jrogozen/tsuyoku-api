import _ from 'lodash';
import { errors } from '../constants';
import { createError } from '../utils/error';

let requireObject = function requireObject(input, requiredKeysArray) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw createError(errors.notEnoughData);
    }

    if (requiredKeysArray && Array.isArray(requiredKeysArray)) {
        let inputKeys = _.keys(input);

        requiredKeysArray.forEach((key) => {
            if (inputKeys.indexOf(key) < 0) {
                throw createError(errors.notEnoughData);
            }
        });
    }
    return true;
};


export { requireObject };