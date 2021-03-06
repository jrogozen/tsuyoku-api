import _ from 'lodash';
import mongoose from 'mongoose';
import flat from 'flat';
import bcrypt from 'bcrypt-nodejs';

import { errors } from '../constants';
import { createError } from '../utils/error';
import { generateRefreshToken, generateAccessToken, processAccessToken } from '../utils/token';

let Schema = mongoose.Schema;

let UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    weight: { type: Number },
    admin: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    api_refresh_token: { type: String },
    fitbit_refresh_token: { type: String },
    maxes: {
        bench_press: { type: Number },
        deadlift: { type: Number },
        press: { type: Number },
        squat: { type: Number }
    },
    created_at: { type: Number },
    updated_at: { type: Number }
});

UserSchema.pre('save', function preSave(next) {

    // this ensures indexes are built before saving. might be a better way to do this
    UserModel.ensureIndexes(() => {
        let user = this;
        let currentDate = Date.now();
        let refreshToken;

        user.updated_at = currentDate;

        // on password change or new user, create a refresh token
        if (!user.created_at || user.isModified('password')) {
            refreshToken = generateRefreshToken(user.device, user._id);
            user.api_refresh_token = refreshToken;
        }

        if (!user.created_at) {
            user.created_at = currentDate;
        }

        // next if password has not been modified
        if (!user.isModified('password')) return next();
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if (err) return next(err);

                user.password = hash;
                next();
            });
        });
    });
});

UserSchema.pre('findOneAndUpdate', function(next) {
    this._update = flat(this._update);

    if (_.keys(this._update).indexOf('password') > -1) {
        const refreshToken = generateRefreshToken(user.device, user._id);
        this._update.api_refresh_token = refreshToken;

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if (err) return next(err);

                this._update.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    if (!candidatePassword || typeof candidatePassword !== 'string' || !cb) {
        return createError(errors.notEnoughData);
    }

    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(createError(err, 402));

        if (!isMatch) {
            return cb(createError(errors.noAuthorization, 402));
        }

        cb(null, isMatch);
    });
};

UserSchema.methods.compareRefreshToken = function compareRefreshToken(refreshToken, secret) {
    let user = this;

    if (!refreshToken || typeof refreshToken !== 'string' || !secret || typeof secret !== 'string') {
        return createError(errors.token);
    }

    if (refreshToken !== user.api_refresh_token) {
        return createError(errors.tokenMismatch, 402);
    }

    return generateAccessToken(user._id, secret);
};

let UserModel = mongoose.model('User', UserSchema)

export default UserModel;