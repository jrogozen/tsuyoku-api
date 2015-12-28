import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testAdmin;
let testUser;

describe('/users/:userId - DELETE', () => {
    before((done) => {
        listen().then(() => {
            requester
                .post('/users')
                .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
                .end((err, res) => {
                    testAdmin = res.body.data;

                    requester.post('/users')
                        .send({ email: 'mahalo@gmail.com', password: '123456' })
                        .end((err, res) => {
                            testUser = res.body.data;
                            done();
                        });
                });
        });
    });

    it('should fail if no token', (done) => {
        requester.delete('/users/' + testUser._id)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should fail if not authorized', (done) => {
        requester.delete('/users/' + testAdmin._id)
            .set('x-access-token', testUser.api_access_token)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthorization);
                done();
            });
    });

    it('should delete user from db', (done) => {
        requester.delete('/users/' + testUser._id)
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq.true;

                requester.get('/users/' + testUser._id)
                    .set('x-access-token', testAdmin.api_access_token)
                    .expect(404)
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res.body.success).to.be.false;
                        expect(res.body.error).to.eq(errors.noMatchingRecord);
                        done();
                    });
            })
    });

    it('should return the deleted userId only', (done) => {
        requester.delete('/users/' + testAdmin._id)
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq.true;
                expect(res.body.data._id).to.eq(testAdmin._id);
                expect(res.body.api_access_token).to.be.undefined;
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});