import _ from 'lodash';
import util from 'util';

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

let weekToMonth = function weekToMonth(week, recursive) {
    let month = week;
    let initial = recursive;

    if (month < 4) {
        if (!initial) {
            return 1;
        } else {
            return month;
        }
    } else {
        return weekToMonth(Math.ceil(month / 4), true);
    }
};

let inspect = function inspect(obj) {
    console.log(util.inspect(obj, false, null));
};

export { requireObject, repeater, reduceWeek, weekToMonth, inspect };