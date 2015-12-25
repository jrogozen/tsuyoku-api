import jwt from 'jsonwebtoken';
import promise from 'promise';

import { errors, defaultAccessToken } from '../constants';

let randomString = function randomString(len) {
    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rstring = '';

    for (var i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        rstring += charSet.substring(randomPoz,randomPoz+1);
    }
    return rstring;
}

let generateRefreshToken = function generateRefreshToken(device, id) {
    let userDevice = device;

    if (!userDevice) {
        userDevice = 'default';
    }

    if (!id) {
        return new Error(errors.token);
    }

    let refreshToken;
    let firstRandomString = randomString(6);
    let secondRandomString = randomString(6);

    refreshToken = firstRandomString + ';' + userDevice + '-' + id + ';' + secondRandomString;

    return refreshToken;
}

let generateAccessToken = function generateToken(user, secret) {
    let tokenInfo;
    let token;

    if (!user || (user && !user._id) || !secret) {
        return new Error(errors.token);
    }
    
    tokenInfo = Object.assign({}, defaultAccessToken, {
        subject: user._id
    });

    token = jwt.sign({}, secret, tokenInfo);

    return token;
}

let processAccessToken = function processAccessToken(accessToken, secret) {
    let decodePromise;
    let token;

    if (!accessToken || !secret) {
        return new Error(errors.token);
    }

    decodePromise = new promise((resolve, reject) => {
        jwt.verify(accessToken, secret, (err, decoded) => {
            if (err) reject(new Error(errors.token));

            resolve(decoded);
        });
    });

    return decodePromise.then((t) => {
        let tokenInfo = Object.assign({}, defaultAccessToken, {
            subject: t.sub
        });

        token = jwt.sign({}, secret, tokenInfo);

        return token;
    }).catch(() => {
        return new Error(errors.token);
    });
}

export { generateRefreshToken, generateAccessToken, processAccessToken };

