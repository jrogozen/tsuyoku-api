import _ from 'lodash';
import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { workoutFactory } from '../factories/workout';
import { routineFactory } from '../factories/routine';
import { liftFactory } from '../factories/lift';
import { authorize } from '../utils/auth';
import { requireObject } from '../utils/generic';
import UserModel from '../schemas/user';
import WorkoutModel from '../schemas/workout';

let router = express.Router();

router.post('/', (req, res, next) => {
    let body = req.body;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    try {
        requireObject(body, ['lifts', 'routine', 'userId']);
    } catch(err) {
        next(err);
    }

    tokenValidation.then((decoded) => {
        authorize(body.userId, decoded.userId).then((auth) => {
            let lift;
            let accessoryLift;
            let routine;
            let processedWorkout;
            let workout = {};

            // process lifts through factory
            if (body.lifts.length > 0) {
                workout.lifts = body.lifts.map((l) => {
                    lift = liftFactory(l);

                    if (!errorCheck(lift)) {
                        return lift;
                    }
                });
            }

            // process routine
            routine = routineFactory(body.routine);

            if (!errorCheck(routine)) {
                workout.routine = routine;
            }

            // process accessory_lifts
            if (body.accessory_lifts && body.accessory_lifts.length > 0) {
                workout.accessory_lifts = body.accessory_lifts.map((al) => {
                    accessoryLift = liftFactory(al);

                    if (!errorCheck(accessoryLift)) {
                        return accessoryLift;
                    }
                })
            }

            workout.userId = body.userId;

            processedWorkout = workoutFactory(workout);

            if (errorCheck(processedWorkout)) {
                return next(processedWorkout);
            }

            WorkoutModel.create(processedWorkout, (err, w) => {
                let savedWorkout, accessToken;

                if (err) {
                    return next(errorCheck(err));
                }

                savedWorkout = w.toObject();

                accessToken = generateAccessToken(body.userId, config.jwtSecret);

                res.status(200).json({
                    success: true,
                    data: savedWorkout,
                    api_access_token: accessToken
                });
            });
        }).catch((err) => next(err));

    }).catch((err) => next(err));
});

export default router;