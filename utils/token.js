import jwt from 'jsonwebtoken';
import promise from 'promise';

import { createError, errorCheck } from '../utils/error';
import { errors, defaultAccessToken } from '../constants';

let randomString = function randomString(len) {
    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rstring = '';

    for (var i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        rstring += charSet.substring(randomPoz,randomPoz+1);
    }
    return rstring;
};

let generateRefreshToken = function generateRefreshToken(device, id) {
    let userDevice = device;

    if (!userDevice) {
        userDevice = 'default';
    }

    if (!id) {
        return createError(errors.token, 500);
    }

    let refreshToken;
    let firstRandomString = randomString(6);
    let secondRandomString = randomString(6);

    refreshToken = firstRandomString + ';' + userDevice + '-' + id + ';' + secondRandomString;

    return refreshToken;
};

let generateAccessToken = function generateToken(id, secret) {
    let tokenInfo;
    let token;

    if (!id || !secret) {
        return createError(errors.token, 500);
    }
    
    tokenInfo = Object.assign({}, defaultAccessToken, {
        subject: id
    });

    token = jwt.sign({}, secret, tokenInfo);

    return token;
};

let processAccessToken = function processAccessToken(accessToken, secret) {
    let token;

    return new promise((resolve, reject) => {
        if (!accessToken || !secret) {
            reject(createError(errors.noAuthentication, 402));
        }

        jwt.verify(accessToken, secret, (err, decoded) => {
            let tokenInfo;

            if (err || !decoded) {
                return reject(createError(errors.token, 402))
            }

            tokenInfo = Object.assign({}, defaultAccessToken, {
                subject: decoded.sub
            });

            token = jwt.sign({}, secret, tokenInfo);

            resolve(token);
        });
    })
        .then((token) => token)
        .catch((err) => { throw(err) });
};

export { generateRefreshToken, generateAccessToken, processAccessToken };

