import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { authorize } from '../utils/auth';
import { requireObject } from '../utils/generic';
import UserModel from '../schemas/user';

let router = express.Router();

router.post('/login', (req, res, next) => {
    let body = req.body;

    // handle email/pw login
    if (body.email && body.password) {
        UserModel.findOne({ email: body.email }).then((u) => {
            if (!u) {
                next(createError(errors.noMatchingRecord));
            }

            u.comparePassword(body.password, (err, isMatch) => {
                let token;
                let user;

                if (err) {
                    return next(err);
                }

                token = generateAccessToken(u._id, config.jwtSecret);
                user = Object.assign({}, u.toObject());

                delete user['password'];

                res.status(200).json({
                    success: true,
                    data: user,
                    api_access_token: token
                });
            })
        }).then(null, (err) => next(createError(err)));
    }
});

export default router;