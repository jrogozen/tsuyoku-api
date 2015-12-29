import _ from 'lodash';
import { createError } from '../utils/error';
import { errors } from '../constants';

let defaultLift = {
    name: null,
    weight: [],
    created_at: null
};

let liftFactory = function liftFactory(liftDetails) {
    let lift;

    if (!liftDetails || typeof liftDetails !== 'object' || Array.isArray(liftDetails)  || !liftDetails.name) {
        return createError(errors.notEnoughData);
    }

    if (!Array.isArray(liftDetails.weight) || liftDetails.weight.length < 1) {
        return createError(errors.notEnoughData);
    }

    lift = Object.create(defaultLift);

    lift.weight = liftDetails.weight;
    lift.name = liftDetails.name;

    return lift;
};

export { liftFactory };