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
    const token = req.body.token || req.params.token || req.headers['x-access-token'];
    const body = req.body;

    if (body.email && body.password) {
        UserModel.findOne({ email: body.email }).then((u) => {
            if (!u) {
                next(createError(errors.noMatchingRecord, 404));
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
    } else if (body.api_refresh_token) {
        try {
            requireObject(body, ['userId']);
        } catch(err) {
            return next(err);
        }

        UserModel.findOne({ _id: body.userId }).then((u) => {
            let token;
            let user;

            if (!u) {
                return next(createError(errors.noMatchingRecord, 404));
            }

            token = u.compareRefreshToken(body.api_refresh_token, config.jwtSecret);
            user = Object.assign({}, u.toObject());

            if (errorCheck(token)) {
                return next(token);
            }

            delete user['password'];

            res.status(200).json({
                success: true,
                data: user,
                api_access_token: token
            });
        }).then(null, (err) => next(createError(err)));
    } else if (token) {
        const tokenValidation = processAccessToken(token, config.jwtSecret);

        tokenValidation
            .then((decoded) => {
                const userId = decoded.userId;

                UserModel.findOne({ _id: userId }).then((u) => {
                    if (!u) {
                        return next(createError(errors.noMatchingRecord, 404));
                    }

                    const newToken = generateAccessToken(u._id, config.jwtSecret);
                    const user = Object.assign({}, u.toObject());

                    delete user['password'];

                    res.status(200).json({
                        success: true,
                        data: user,
                        api_access_token: newToken
                    });
                });
            });
    } else {
        res.status(500).json({
            success: false,
            error: createError(errors.notEnoughData)
        });
    }
});

export default router;