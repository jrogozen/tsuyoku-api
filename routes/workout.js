import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { workoutFactory } from '../factories/workout';
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
        authorize(body.userId, decoded.userId).then(() => {
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

router.get('/byUser', (req, res, next) => {
    let query = req.query;
    let limit = Number(query.limit);
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);
    // requires userId, routineName
    // optional limit, sort, sortOrder, routineName

    try {
        requireObject(query, ['userId', 'routineName']);
    } catch(err) {
        next(err)
    }

    tokenValidation.then((decoded) => {
        authorize(query.userId, decoded.userId).then(() => {
            WorkoutModel.find({
                'userId': query.userId,
                'routine.name': query.routineName
            }).limit(limit).sort('-created_at').exec().then((workouts) => {
                let filteredWorkouts = [].concat(workouts);

                if (filteredWorkouts.length > 0) {
                    if (query.liftName) {
                        filteredWorkouts = filteredWorkouts.filter((w) => {
                            w.lifts = w.lifts.filter((l) => {
                                return l.name === query.liftName;
                            });

                            if (w.lifts.length > 0) {
                                return w;
                            }
                        });
                    }
                }

                res.status(200).json({
                    success: true,
                    data: filteredWorkouts,
                    api_access_token: decoded.token
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