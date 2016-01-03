import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { authorize } from '../utils/auth';
import { requireObject } from '../utils/generic';
import { guideFactory } from '../factories/guide';
// import UserModel from '../schemas/user';

let router = express.Router();

router.put('/', (req, res, next) => {
    let body = req.body;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    try {
        requireObject(body, ['userId', 'routine', 'maxes']);
    } catch(err) {
        next(err);
    }

    tokenValidation.then((decoded) => {
        authorize(body.userId, decoded.userId).then(() => {
            let guide = guideFactory({
                routine: body.routine,
                maxes: body.maxes
            });

            if (errorCheck(guide)) {
                return next(guide);
            }

            res.status(200).json({
                success: true,
                data: guide,
                api_access_token: decoded.token
            });
        }).catch((err) => next(err));
    }).catch((err) => next(err));
});

export default router;