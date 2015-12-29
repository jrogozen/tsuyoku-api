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
    let lifts, accessoryLifts, routine, workoutDetails;

    try {
        requireObject(body, ['lifts', 'routine', 'userId']);
    } catch(err) {
        next(err);
    }

    tokenValidation.then((decoded) => {
        authorize(body.userId, decoded.userId).then((auth) => {

        }).catch((err) => next(err));

    }).catch((err) => next(err));
});

export default router;