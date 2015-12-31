import _ from 'lodash';

import { requireObject } from '../utils/generic';
import { liftFactory } from './lift';
import { routineFactory } from './routine';
import { createError, errorCheck } from '../utils/error';
import { errors } from '../constants';

let defaultWorkout = {
    routine: null,
    lifts: [],
    accessory_lifts: null,
    userId: null
};

let workoutFactory = function workoutFactory(workoutDetails) {
    let workout = {};
    let routine;

    try {
        requireObject(workoutDetails, ['lifts', 'routine', 'userId']);
    } catch(err) {
        return err;
    }

    if (!Array.isArray(workoutDetails.lifts) || (workoutDetails.accessory_lifts && !Array.isArray(workoutDetails.accessory_lifts))) {
        return createError(errors.notEnoughData);
    }

    if (workoutDetails.lifts.length > 0) {
        workout.lifts = workoutDetails.lifts.map((l) => {
            let lift = liftFactory(l);

            if (!errorCheck(lift)) {
                return lift;
            }
        });
    }

    routine = routineFactory(workoutDetails.routine);

    if (!errorCheck(routine)) {
        workout.routine = routine;
    }

    if (workoutDetails.accessory_lifts && workoutDetails.accessory_lifts.length > 0) {
        workout.accessory_lifts = workoutDetails.accessory_lifts.map((al) => {
            let accessoryLift = liftFactory(al);

            if (!errorCheck(accessoryLift)) {
                return accessoryLift;
            }
        })
    }

    workout.userId = workoutDetails.userId;

    return Object.assign({}, defaultWorkout, workout);
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