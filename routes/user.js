import _ from 'lodash';
import express from 'express';

import * as config from '../config';
import { errors } from '../constants';
import { errorCheck, createError } from '../utils/error';
import { generateAccessToken, processAccessToken } from '../utils/token';
import { userFactory, updateUserFactory } from '../factories/user.js';
import { authorize } from '../utils/auth';
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
        accessToken = generateAccessToken(u._id, config.jwtSecret);

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

    tokenValidation
        .then((decoded) => {
            UserModel.findOne({_id: userId})
                .then((u) => {
                    let foundUser;

                    if (!u) {
                        return next(createError(errors.noMatchingRecord, 404));
                    }

                    foundUser = u.toObject();
                    delete foundUser['api_refresh_token'];
                    delete foundUser['password'];
                    
                    res.status(200).json({
                        success: true,
                        data: foundUser,
                        api_access_token: decoded.token
                    });
                })
                .then(null, (err) => {
                    return next(createError(errors.couldNotProcessRequest, 500));
                });
        })
        .catch((err) => next(err));
});

router.get('/', (req, res, next) => {
    let limit = Number(req.query.limit) || 10;
    let skip = Number(req.query.skip) || 0;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    tokenValidation
        .then((decoded) => {
            UserModel.count().exec().then((c) => {
                let count = c;

                UserModel.find().skip(skip).limit(limit).exec()
                    .then((users) => {
                        let parsedUsers = users.map((user) => {
                            let tempUser = user.toObject();
                            delete tempUser['password'];
                            delete tempUser['api_refresh_token'];

                            return tempUser;
                        });

                        res.status(200).json({
                            success: true,
                            data: {
                                users: parsedUsers,
                                totalUsers: count,
                            },
                            api_access_token: decoded.token
                        });
                    })
                    .then(null, (err) => {
                        return next(createError(errors.couldNotProcessRequest, 500));
                    })
            })

        })
        .catch((err) => next(err))
});

router.put('/:id', (req, res, next) => {
    let body = req.body;
    let requestId = req.params.id;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    tokenValidation
        .then((decoded) => {
            let user;
            let authorized = authorize(requestId, decoded.userId);

            authorized.then((auth) => {
                let updateDetails = updateUserFactory(body);

                if (errorCheck(updateDetails)) {
                    return next(updateDetails);
                }

                UserModel.findOneAndUpdate({ _id: requestId}, updateDetails, { new: true }, function(err, u) {
                    if (err || !u) {
                        return next(createError(errors.noMatchingRecord, 404));
                    }

                    const trimmedUser = Object.assign({}, u.toObject());

                    delete trimmedUser['password'];
                    delete trimmedUser['api_refresh_token'];

                    res.status(200).json({
                        success: true,
                        data: trimmedUser,
                        api_access_token: decoded.token
                    });
                });
            }).catch((err) => next(err));
        }).catch((err) => next(err));
});

router.delete('/:id', (req, res, next) => {
    let requestId = req.params.id;
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    let tokenValidation = processAccessToken(token, config.jwtSecret);

    tokenValidation.then((decoded) => {
        let authorized = authorize(requestId, decoded.userId);

        authorized.then((auth) => {
            UserModel.remove({ _id: requestId}).then((user) => {
                res.status(200).json({
                    success: true,
                    data: {
                        _id: requestId
                    }
                });
            }).then(null, (err) => next(createError(errors.dbError)));
        }).catch((err) => next(err));
    }).catch((err) => next(err));
});

export default router;