import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';
import WorkoutModel from '../../../schemas/workout';

describe.only('/workout - POST', () => {
    before((done) => {

    });

    after((done) => {

    });
});