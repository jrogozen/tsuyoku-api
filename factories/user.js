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

let userFactory = function userFactory(userDetails, isAdmin) {
    let defaultKeyArray;
    let newUser;

    if (!userDetails || Array.isArray(userDetails) || typeof userDetails !== 'object' || _.isEmpty(userDetails)) {
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
        if (defaultKeyArray.indexOf(k) < 0 || (!isAdmin && (k === 'admin' || k === 'paid'))) {
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

let updateUserFactory = function updateUserFactory(userDetails, isAdmin) {
    let newUser;
    let defaultKeyArray;

    if (!userDetails || Array.isArray(userDetails) || typeof userDetails !== 'object' || _.isEmpty(userDetails)) {
        return createError(errors.notEnoughData);
    }

    // todo: extract validation into util
    if (userDetails.password && userDetails.password.length < 6) {
        return createError(errors.passwordLength);
    }

    // do not let someone becoem me :).
    // should not allow it on mongoose side either (unique emails)
    if (userDetails.email && userDetails.email === 'jon.rogozen@gmail.com') {
        return createError(errors.noAuthorization, 402);
    }

    defaultKeyArray = _.keys(defaultUser);

    _.forEach(userDetails, (v,k) => {
        if (defaultKeyArray.indexOf(k) < 0 || (!isAdmin && (k === 'admin' || k === 'paid'))) {
            delete userDetails[k];
        }
    });

    return Object.assign({}, userDetails);
};

export { userFactory, updateUserFactory };