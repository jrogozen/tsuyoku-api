import _ from 'lodash';

import { requireObject } from '../utils/generic';
import { liftFactory } from './lift';
import { routineFactory } from './routine';
import { createError, errorCheck } from '../utils/error';
import { errors } from '../constants';

let defaultWorkout = {
    routine: null,
    lifts: [],
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

    if (!Array.isArray(workoutDetails.lifts)) {
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

    workout.userId = workoutDetails.userId;

    return Object.assign({}, defaultWorkout, workout);
};

export { workoutFactory };

/*
    the user collection should store options for different routines
    and the createRoutine route should use that info to construct the "next" workout
    accessory_lifts don't have to be stored in the db either, they can be extrapolated from 
    user options and 1rep/max

    there needs to be a 1rep/max stored in user collection. it should be updated at specific week cycles
    ie: Workout.save() => if routine === 5/3/1 and week % 4 === 0, update 1rep/max

    workout is comprised of...

    routine: {
        name: '5/3/1',
        week: 2
    },

    lifts: [
        {
            name: 'bench press',
            weight: [225, 250, 265],
        }
    ],
    

    created_at: 11212
    updated_at: 12121,
    userId: 1,
    totalWeight: 10240,
*/

