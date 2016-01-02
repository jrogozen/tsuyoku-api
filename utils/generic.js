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

let repeater = function repeater(val, count) {
    let arr = [];

    // transform val to a number we can work with in gym (2.5 * 2 = 5)
    val = (Math.round(val / 5) * 5);

    for (let i = 0; i < count; i++) {
        arr.push(val);
    }

    return arr;
};

let reduceWeek = function reduceWeek(week) {
    if (week % 4 === 0) {
        return 4;
    } else if (week % 3 === 0) {
        return 3;
    } else if (week % 2 === 0) {
        return 2;
    } else {
        return 1;
    }
};

let weekToMonth = function weekToMonth(week) {
    let month = week;

    if (month < 4) {
        return week;
    } else {
        return weekToMonth(Math.ceil(month / 4));
    }
};

export { requireObject, repeater, reduceWeek, weekToMonth };