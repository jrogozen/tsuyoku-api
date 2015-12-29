import _ from 'lodash';

import { requireObject } from '../utils/generic'; 
import { createError } from '../utils/error';
import { errors } from '../constants';

let routines = {
    '5/3/1': {
        name: '5/3/1',
        week: 1,
        options: {
            accessory: null,
            deload: true
        }
    },
    '3x5': {
        name: '3x5',
        week: 1,
        options: {

        }
    },
    '5x5': {
        week: 1,
        options: {

        }
    },
    'misc': {
        week: null
    }
};

let routineFactory = function routineFactory(routineOptions) {
    let routine;
    let options = routineOptions;
    let validKeysArray;

    try {
        requireObject(options, ['name']);
    } catch(err) {
        return err;
    };

    if (!routines[options.name]) {
        return createError(errors.notEnoughData);
    }

    // merge will deep merge options, assign will not
    return _.merge({}, routines[options.name], options);
};

export { routineFactory };