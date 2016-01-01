import _ from 'lodash';

import { requireObject } from '../utils/generic'; 
import { createError } from '../utils/error';
import { errors } from '../constants';

let routines = {
    '5/3/1': {
        name: '5/3/1',
        week: 1
    },
    '3x5': {
        name: '3x5',
        week: 1
    },
    '5x5': {
        week: 1
    },
    'misc': {
        name: 'misc',
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

    routine = Object.assign({}, routines[options.name]);

    if (options.week) {
        routine.week = options.week;
    }

    return routine;
};

export { routineFactory };