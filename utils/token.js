import jwt from 'jsonwebtoken';
import promise from 'promise';

import { errors } from '../constants';

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
  
    token = jwt.sign({}, secret, {
        expiresIn: 1200,
        issuer: 'tsuyoku-api',
        subject: user._id
    });

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
        token = jwt.sign({}, secret, {
            expiresIn: 1200,
            issuer: t.iss,
            subject: t.sub
        });
        return token;
    }).catch(() => {
        return new Error(errors.token);
    });
}

export { generateRefreshToken, generateAccessToken, processAccessToken };

