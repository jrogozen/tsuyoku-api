import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;
let testUser2;

describe('/users/:userId - PUT', () => {
    before((done) => listen().then(() => {
        requester
            .post('/users/')
            .send({ email: 'mahalo@gmail.com', password: '123456' })
            .end((err, res) => {
                testUser = res.body.data;
                requester
                    .post('/users/')
                    .send({
                        email: 'mahalosixer@gmail.com', password: '654321',
                        maxes: { deadlift: 225 }
                    })
                    .end((err, res) => {
                        testUser2 = res.body.data;
                        done();
                    })
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
                expect(body.success).to.be.false;
                expect(body.error).to.eq(errors.notEnoughData);
                done();
            });
    });

    it('should fail if user is not authorized', (done) => {
        requester
            .put('/users/' + testUser._id)
            .set('x-access-token', testUser2.api_access_token)
            .send({age: 15})
            .expect(402)
            .end((err, res) => {
                let body = res.body;

                expect(err).to.be.null
                expect(body.success).to.be.false;
                expect(body.error).to.eq(errors.noAuthorization);
                done();
            });
    });

    it('should fail if no matching id in db', (done) => {
        let adminUser;
        let bogusId = String(testUser._id).replace(/\w/g, '1');

        requester
            .post('/users/')
            .send({ email: 'jon.rogozen@gmail.com', password: '654321' })
            .end((err, res) => {
                adminUser = res.body.data;

                requester
                    .put('/users/' + bogusId)
                    .set('x-access-token', adminUser.api_access_token)
                    .send({ age: 42 })
                    .expect(404)
                    .end((err, res) => {
                        let body = res.body;

                        expect(err).to.be.null;
                        expect(body.success).to.be.false;
                        expect(body.error).to.eq(errors.noMatchingRecord);
                        done();
                    });
            });
    });

    it('should work with nested data', (done) => {
        requester
            .put('/users/' + testUser2._id)
            .set('x-access-token', testUser2.api_access_token)
            .send({ maxes: { squat: 350 }})
            .expect(200)
            .end((err, res) => {
                const body = res.body

                expect(err).to.be.null;
                expect(body.success).to.be.true;
                expect(body.data).to.be.an('object');
                expect(body.data.email).to.eq('mahalosixer@gmail.com');
                expect(body.data.maxes).to.be.an('object');
                expect(body.data.maxes.squat).to.eq(350);
                expect(body.data.maxes.deadlift).to.eq(225);
                expect(body.api_access_token).to.be.a('string');

                requester
                    .get('/users/' + testUser2._id)
                    .set('x-access-token', testUser2.api_access_token)
                    .expect(200)
                    .end((err, res) => {
                        const body = res.body;

                        expect(err).to.be.null;
                        expect(body.data.maxes).to.be.an('object');
                        expect(body.data.maxes.squat).to.eq(350);
                        expect(body.data.maxes.deadlift).to.eq(225);

                        done();
                    });
            });
    });

    it('should return new user with a new access token', (done) => {
        setTimeout(() => {
            requester
                .put('/users/' + testUser._id)
                .set('x-access-token', testUser.api_access_token)
                .send({ age: 42, weight: 160, email: 'poopface@gmail.com' })
                .expect(200)
                .end((err, res) => {
                    let body = res.body;

                    expect(err).to.be.null;
                    expect(body.success).to.be.true;
                    expect(body.data).to.be.an('object');
                    expect(body.data.email).to.eq('poopface@gmail.com');
                    expect(body.data.age).to.eq(42);
                    expect(body.data.weight).to.eq(160);
                    expect(body.api_access_token).to.be.a('string');
                    expect(body.api_access_token).to.not.eq(testUser.api_access_token);
                    done();
                });
        }, 1000);
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});