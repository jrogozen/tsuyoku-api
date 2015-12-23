import { app as App } from '../../server';
import { expect } from 'chai';

import { errors } from '../../constants';

describe('User Routes', () => {
    describe('POST /users', () => {
        it ('should return an error if not enough data', (done) => {

        });

        it ('should save user to db', (done) => {

        });

        it ('should error if db save fails', (done) => {

        });

        it ('should return a user object', (done) => {

        });

        it ('should return a valid a user (api) token', (done) => {

        });

        it ('should not allow users with duplicate email addresses', (done) => {

        });

        it ('should require passwords to be a min. length', (done) => {

        });

        it ('should make jon.rogozen@gmail.com an admin', (done) => {

        });

        it ('should not make normal users admins or paid', (done) => {

        });
    });
});