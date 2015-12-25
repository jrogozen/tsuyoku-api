import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

describe('POST /users', () => {
    before((done) => {
        listen().then(() => done());
    });

    it('should return an error if not enough data', (done) => {
        requester
            .post('/users/')
            .send({})
            .expect('Content-type', /json/)
            .expect(500)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.error).to.equal(errors.notEnoughData);
                expect(res.body.success).to.equal(false);
                done();
            });
    });

    it('should save user to db', (done) => {
        requester
            .post('/users/')
            .send({
                email: 'saveusertodb@gmail.com',
                password: '123456'
            })
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.equal(true);
                UserModel.findOne({
                    email: res.body.email
                }).exec((err, foundUser) => {
                    expect(err).to.be.null;
                    expect(foundUser.email).to.eq(res.body.email);
                    expect(foundUser.password).to.not.be.null;
                    done();
                });
            });
    });

    it('should return a user object without password hash', (done) => {
        requester
            .post('/users/')
            .send({
                email: 'passwordtest@gmail.com',
                password: '123456',
                age: 24,
                weight: 160
            })
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                let user = res.body;

                expect(user.email).to.eq('passwordtest@gmail.com');
                expect(user.password).to.be.undefined;
                expect(user.api_refresh_token).to.be.a('string');
                expect(user.age).to.eq(24);
                expect(user.weight).to.eq(160);
                expect(user.created_at).to.not.be.null;
                done();
            });
    });

    it('should return a valid a user (api) token', (done) => {
        requester
            .post('/users/')
            .send({
                email: 'tokentest@gmail.com',
                password: '123456'
            })
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                let user = res.body;
                let accessToken = user.api_access_token;
                let decodedAccessToken;

                expect(accessToken).to.be.a('string');

                decodedAccessToken = jwt.verify(accessToken, config.jwtSecret);

                expect(decodedAccessToken).to.be.an('object');
                expect(decodedAccessToken.iss).to.eq(defaultAccessToken.issuer);
                expect(decodedAccessToken.sub).to.eq(user._id);
                done();
            })
    });

    it('should not allow users with duplicate email addresses', (done) => {
        let userOne = {
            email: 'mahalo@gmail.com',
            password: '123456'
        };
        let userTwo = {
            email: 'mahalo@gmail.com',
            password: '123456'
        };

        requester
            .post('/users/')
            .send(userOne)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(res.body.email).to.eq('mahalo@gmail.com')

                requester
                    .post('/users/')
                    .send(userTwo)
                    .expect(500)
                    .expect('Content-type', /json/)
                    .end((err, res) => {
                        expect(res.body.success).to.be.false;
                        expect(res.body.error).to.eq(errors.dbError);
                        
                        UserModel.find({ email: 'mahalo@gmail.com' })
                            .exec((err, result) => {
                                expect(err).to.be.null;
                                expect(result.length).to.eq(1);
                                done();
                            });
                    });
            });
    });

    it('should assign correct permissions', (done) => {
        let newUser = {
            email: 'checkPermissions@gmail.com',
            password: '123456'
        };
        let newAdmin = {
            email: 'jon.rogozen@gmail.com',
            password: '123456'
        };

        requester
            .post('/users/')
            .send(newUser)
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                let u = res.body;

                expect(u.admin).to.be.false;
                expect(u.paid).to.be.false;
                expect(u.email).to.eq('checkPermissions@gmail.com');

                requester
                    .post('/users/')
                    .send(newAdmin)
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        let u = res.body;

                        expect(err).to.be.null;
                        expect(u.admin).to.be.true;
                        expect(u.paid).to.be.true;
                        expect(u.email).to.eq('jon.rogozen@gmail.com');
                        done();
                    });
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});
