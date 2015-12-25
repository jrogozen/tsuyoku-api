import express from 'express';
import mongoose from 'mongoose';

import * as config from '../config';
import { errors } from '../constants';
import errorCheck from '../utils/errorCheck';
import { generateAccessToken, processAccessToken } from '../utils/token';
import userFactory from '../factories/user.js';
import UserModel from '../schemas/user';

let router = express.Router();

router.post('/', (req, res) => {
    let error;
    let user;
    let savedUser;
    let body = req.body;

    user = userFactory(body);
    error = errorCheck(user, error);

    if (!error) {
        UserModel.create(user, (err, u) => {
            let accessToken;

            error = errorCheck(err, error);

            if (error) {
                res.status(500).send({
                    success: false,
                    error: error.message
                });
            } else {
                savedUser = u.toObject();

                // append a generated access token
                accessToken = generateAccessToken(u, config.jwtSecret);
                error = errorCheck(err, error);

                // todo: better way to consolidate these?
                if (error) {
                    res.status(500).send({
                        success: false,
                        error: error.message
                    });
                }

                savedUser.api_access_token = accessToken;

                // remove sensitive info before returning
                if (savedUser.password) {
                    delete savedUser['password'];
                }

                res.json(Object.assign({
                    success: true
                }, savedUser));
            }
        });
    } else {
        res.status(500).send({
            success: false,
            error: error.message
        });
    }


});

export default router;