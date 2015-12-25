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

        // append a generated access token
        accessToken = generateAccessToken(u, config.jwtSecret);

        savedUser.api_access_token = accessToken;

        // remove sensitive info before returning
        if (savedUser.password) {
            delete savedUser['password'];
        }

        res.json(Object.assign({
            success: true
        }, savedUser));
    });
});

export default router;