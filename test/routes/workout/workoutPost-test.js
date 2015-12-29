import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';
import WorkoutModel from '../../../schemas/workout';

describe('/workout - POST', () => {
    before((done) => listen().then(() => done()));

    xit('should error if not enough data', () => {

    });

    xit('should error if no api access token', () => {

    });

    xit('should error if no authorization', () => {

    });

    xit('should save workout to db', () => {

    });

    xit('should return a workout object', () => {

    });

    xit('should return an api token', () => {

    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});