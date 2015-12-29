import _ from 'lodash';

import { requireObject } from '../utils/generic';
import { liftFactory } from './lift';
import { routineFactory } from './routine';
import { createError } from '../utils/error';
import { errors } from '../constants';

let defaultWorkout = {
    routine: null,
    lifts: [],
    accessory_lifts: null,
    userId: null
};

let workoutFactory = function workoutFactory(workoutDetails) {
    try {
        requireObject(workoutDetails, ['lifts', 'routine', 'userId']);
    } catch(err) {
        return err;
    }

    if (!Array.isArray(workoutDetails.lifts) || !Array.isArray(workoutDetails.accessory_lifts)) {
        return createError(errors.notEnoughData);
    }

    return Object.assign({}, defaultWorkout, workoutDetails);
};

export { workoutFactory };

/*
    workout is comprised of...
    routine: {
        name: 5/3/1,
        week: 2,
        options: {
            accessory: 'boring but big',
            deload: true
        }
    },
    lifts: [
        {
            name: 'bench press',
            weight: [225, 250, 265],
        }
    ],
    accessory_lifts: [
        {
            name: 'bench press',
            weight: [110, 110, 110, 110, 110]
        }
    ],
    created_at: 11212
    updated_at: 12121,
    userId: 1
*/