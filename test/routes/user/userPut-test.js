import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;

describe.only('/users/:userId - PUT', () => {
    before((done) => listen().then(() => {
        requester
            .post('/users/')
            .send({ email: 'mahalo@gmail.com', password: '123456' })
            .end((err, res) => {
                testUser = res.body.data;
                done();
            });
    }));

    it('should fail if no access token', (done) => {
        requester
            .put('/users/' + testUser._id)
            .expect(402)
            .send({ age: 12 })
            .end((err, res) => {
                let body = res.body;

                expect(err).to.be.null;
                expect(body.success).to.be.false;
                expect(body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should fail if no info to PUT', (done) => {
        requester
            .put('/users/' + testUser._id)
            .set('x-access-token', testUser.api_access_token)
            .expect(500)
            .end((err, res) => {
                let body = res.body;

                expect(err).to.be.null
                expect(body).success.to.be.false;
                expect(body.error).to.eq(errors.notEnoughData);
                done();
            });
            
    });

    xit('should fail if user is not authorized', () => {

    });

    xit('should update the db', () => {

    });

    xit('should return new user with a new access token', () => {

    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});