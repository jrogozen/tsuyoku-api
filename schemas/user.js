import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { errors } from '../constants';

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
    created_at: { type: Number },
    updated_at: { type: Number }
});

UserSchema.pre('save', function (next) {
    let user = this;

    let currentDate = Date.now();

    user.updated_at = currentDate;

    // on password change or new user, create a refresh token
    if (!user.created_at || user.isModified('password')) {

    }

    if (!user.created_at) {
        user.created_at = currentDate;
    }

    // next if password has not been modified
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    if (!candidatePassword || typeof candidatePassword !== 'string' || !cb) {
        return new Error(errors.notEnoughData);
    }

    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);

        cb(null, isMatch);
    });
};

// todo: compareRefreshToken
UserSchema.methods.compareRefreshToken = function compareRefreshToken(refreshToken) {
    let user = this;


    if (!refreshToken) {
        return new Error(errrors.token);
    }

};


let UserModel = mongoose.model('User', UserSchema)

export default UserModel;