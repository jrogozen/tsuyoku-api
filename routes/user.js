import express from 'express';
import mongoose from 'mongoose';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import userFactory from '../factories/user.js';
import UserModel from '../schemas/user';

let router = express.Router();

router.post('/', (req, res, next) => {
    let user;
    let savedUser;
    let body = req.body;

    user = userFactory(body);

    if (errorCheck(user)) {
        return next(user);
    }

    UserModel.create(user, (err, u) => {
        let accessToken;

        if (err) {
            return next(errorCheck(err));
        }

        savedUser = u.toObject();

        delete savedUser['password'];

        // append a generated access token
        accessToken = generateAccessToken(u, config.jwtSecret);

        savedUser.api_access_token = accessToken;

        res.json({
            success: true,
            data: savedUser
        });
    });
});

router.get('/:id', (req, res, next) => {
    let userId = req.params.id;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    if (errorCheck(tokenValidation)) {
        return next(errorCheck(tokenValidation));
    }

    tokenValidation.then((token) => {
        if (errorCheck(token)) {
            return next(errorCheck(token), 402);
        }

        UserModel.findOne({_id: userId})
            .then((u) => {
                let foundUser;

                if (!u) {
                    return next(createError(errors.noMatchingRecord, 404));
                }

                foundUser = u.toObject();
                delete foundUser['api_refresh_token'];

                res.status(200).json({
                    success: true,
                    data: foundUser
                });
            })
            .then(null, (err) => {
                return next(createError(errors.couldNotProcessRequest, 500));
            });
    });


});

export default router;