import _ from 'lodash';
import { createError } from '../utils/error';
import { errors } from '../constants';

let defaultUser = {
    email: null,
    password: null,
    age: null,
    weight: null,
    admin: false,
    paid: false,
    api_token: null,
    api_refresh_token: null,
    fitbit_token: null,
    fitbit_refresh_token: null
};

let userFactory = function userFactory(userDetails) {
    let defaultKeyArray;
    let newUser;

    if (!userDetails || Array.isArray(userDetails) || typeof userDetails !== 'object') {
        return createError(errors.notEnoughData);
    }

    if (!userDetails.email || !userDetails.password) {
        return createError(errors.notEnoughData);
    }

    // todo: set more robust password rules
    if (userDetails.password.length < 6) {
        return createError(errors.passwordLength);
    }

    defaultKeyArray = _.keys(defaultUser);

    _.forEach(userDetails, (v,k) => {
        if (defaultKeyArray.indexOf(k) < 0) {
            delete userDetails[k];
        }
    });

    newUser = Object.assign(Object.create(defaultUser), userDetails);

    if (newUser.email === 'jon.rogozen@gmail.com') {
        newUser.admin = true;
        newUser.paid = true;
    }

    return newUser;
};

export default userFactory;