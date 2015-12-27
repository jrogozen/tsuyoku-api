import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;

 describe('/users/:id - GET', () => {
    before((done) => listen().then(() => {
        requester
            .post('/users/')
            .send({
                email: 'mahalo@gmail.com',
                password: '123456'
            })
            .end((err, res) => {
                testUser = res.body.data;
                done();
            });
    }));

    it('should return an error if no matching id', (done) => {
        let bogusId = String(testUser._id).replace(/\w/g, '1');

        requester
            .get('/users/' + bogusId)
            .set('x-access-token', testUser.api_access_token)
            .expect('Content-type', /json/)
            .expect(404)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq(false);
                expect(res.body.error).to.eq(errors.noMatchingRecord);
                done();
            });
    });

    it('should return an error if not an appropriate id', (done) => {
        requester
            .get('/users/po')
            .set('x-access-token', testUser.api_access_token)
            .expect('Content-type', /json/)
            .expect(500)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq(false);
                expect(res.body.error).to.eq(errors.couldNotProcessRequest);
                done();
            });

    });

    it('should fail if not authenticated (token is  not provided)', (done) => {
        requester
            .get('/users/' + testUser._id)
            .expect('Content-type', /json/)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq(false);
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should return user object without password or tokens', (done) => {
        requester
            .get('/users/' + testUser._id)
            .set('x-access-token', testUser.api_access_token)
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                let user = res.body.data;

                expect(err).to.be.null;
                expect(user._id).to.eq(testUser._id);
                expect(user.email).to.eq(testUser.email);
                expect(user.password).to.be.undefined;
                expect(user.api_access_token).to.be.undefined;
                expect(user.api_refresh_token).to.be.undefined;

                done();
            });
    });

    it('should fail if token does not decode', (done) => {
        requester
            .get('/users/' + testUser._id)
            .set('x-access-token', '52')
            .expect('Content-type', /json/)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.token);
                done();
            });
    });

    it('should not modify the db', (done) => {
        requester
            .get('/users/' + testUser._id)
            .set('x-access-token', testUser.api_access_token)
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.null;

                UserModel.findOne({
                    _id: testUser._id
                })
                .exec()
                .then((u) => {
                    expect(u.email).to.eq(testUser.email);
                    expect(u.created_at).to.eq(u.updated_at);
                    expect(u.api_refresh_token).to.eq(testUser.api_refresh_token);
                    done();
                });
            });
    });

    it('should return a new access token', (done) => {
        setTimeout(() => {
            requester
                .get('/users/' + testUser._id)
                .set('x-access-token', testUser.api_access_token)
                .expect('Content-type', /json/)
                .expect(200)
                .end((err, res) => {
                    let body = res.body;

                    expect(err).to.be.null;
                    expect(body.api_access_token).to.be.a('string');
                    expect(body.api_access_token).to.not.eq(testUser.api_access_token);
                    done();
                });
        }, 1000);
    });

    after((done) => {
        testUser = null;
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});