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
            let processedWorkout = workoutFactory(body);

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

router.get('/:id', (req, res, next) => {
    let workoutId = req.params.id;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    tokenValidation.then((decoded) => {
        WorkoutModel.findOne({ _id: workoutId })
            .then((w) => {
                let foundWorkout;

                if (!w) {
                    return next(createError(errors.noMatchingRecord, 404));
                }

                foundWorkout = w.toObject();

                res.status(200).json({
                    success: true,
                    data: foundWorkout,
                    api_access_token: decoded.token
                });

            }).then(null, (err) => {
                return next(createError(errors.couldNotProcessRequest, 500));
            });
    }).catch((err) => next(err));
});

export default router;