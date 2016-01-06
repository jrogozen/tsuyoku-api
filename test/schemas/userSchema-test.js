import jwt from 'jsonwebtoken';

import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../bootstrapTest';
import UserModel from '../../schemas/user';

const TEST_SECRET = 'supertestsecret';
let testUser;

describe('User Schema', () => {
    before((done) => listen().then(() => done()));

    describe('comparePassword', () => {
        before((done) => {
            UserModel.create({
                email: 'mahalo@gmail.com',
                password: '123456'
            }, (err, u) => {
                testUser = u;
                done();
            });
        });

        it('should error if no pw or cb', () => {
            let noData = testUser.comparePassword();
            let noCb = testUser.comparePassword('test');

            expect(noData.message).to.eq(errors.notEnoughData);
            expect(noCb.message).to.eq(errors.notEnoughData);
        });

        it('should correctly decode a password', (done) => {
            let compare = testUser.comparePassword('123456', (err, isMatch) => {
                expect(err).to.be.null;
                expect(isMatch).to.be.true;
                done();
            })
        });

        it('should correctly error if wrong password', (done) => {
            let badCompare = testUser.comparePassword('12345', (err, isMatch) => {
                expect(err.message).to.eq(errors.noAuthorization);
                expect(isMatch).to.eq(undefined);
                done();
            });
        });

        after((done) => {
            testUser = null;
            mongoose.connection.db.dropDatabase(done);
        });
    });

    describe('compareRefreshToken', () => {
        before((done) => {
            UserModel.create({
                email: 'mahalo@gmail.com',
                password: '123456'
            }, (err, u) => {
                testUser = u;
                done()
            });
        });

        it('should error if no refresh token provided', (done) => {
            let compare = testUser.compareRefreshToken();
            let compareTwo = testUser.compareRefreshToken('aaa');

            expect(compare.message).to.eq(errors.token);
            expect(compare.name).to.eq('Error');
            expect(compareTwo.message).to.eq(errors.token);
            expect(compareTwo.name).to.eq('Error');
            done();
        });

        it('should return a new access token', (done) => {
            let compare = testUser.compareRefreshToken(testUser.api_refresh_token, TEST_SECRET);
            let verifiedToken;

            expect(compare).to.not.be.null;
            expect(compare).to.be.a('string');

            verifiedToken = jwt.verify(compare, TEST_SECRET);

            expect(verifiedToken).to.be.an('object');
            expect(verifiedToken.iss).to.eq(defaultAccessToken.issuer);
            expect(verifiedToken.sub).to.eq(String(testUser._id));
            expect(verifiedToken.iat).to.not.eq(verifiedToken.exp);
            done();
        });

        it('should authorization error if token is invalid', (done) => {
            let compare = testUser.compareRefreshToken('invalid_refresh_token', TEST_SECRET);

            expect(compare.message).to.eq(errors.tokenMismatch);
            expect(compare.name).to.eq('Error');
            done();
        });

        after((done) => {
            testUser = null;
            mongoose.connection.db.dropDatabase(done)
        });
    });

    describe('pre save', () => {
        before((done) => {
            UserModel.create({
                email: 'mahalo@gmail.com',
                password: '123456'
            }, (err, u) => {
                testUser = u;
                done();
            });
        });

        it('should save a created_at and updated_at number on create', () => {
            expect(testUser.created_at).to.not.be.null;
            expect(testUser.created_at).to.be.a('number');
            expect(testUser.created_at).to.eq(testUser.updated_at);
        });

        it('should not update created_at on subsequent saves', (done) => {
            return UserModel
                .findOne({
                    email: 'mahalo@gmail.com'
                })
                .exec()
                .then((u) => {
                    u.age = 26;
                    u.save()
                        .then((uu) => {
                            expect(uu.email).to.eq('mahalo@gmail.com');
                            expect(uu.age).to.eq(26);
                            expect(uu.created_at).to.be.below(uu.updated_at);
                            done();
                        })
                        .then(null, (err) => done(err));
                });
        });

        it('should save a refresh token on create', (done) => {
            return UserModel
                .findOne({
                    email: 'mahalo@gmail.com'
                })
                .exec()
                .then((u) => {
                    expect(u.api_refresh_token).to.not.be.null;
                    expect(u.api_refresh_token).to.be.a('string');
                    done();
                })
                .then(null, (err) => done(err));
        });

        it('should update to new refresh token on pw change', (done) => {
            let oldRefreshToken;
            let oldPasswordHash;

            return UserModel
                .create({
                    email: 'updatepw@gmail.com',
                    password: '123456'
                })
                .then((u) => {
                    oldRefreshToken = u.api_refresh_token;
                    oldPasswordHash = u.password;

                    u.password = '654321';
                    u.save()
                        .then((uu) => {
                            expect(oldRefreshToken).to.not.eq(uu.api_refresh_token);
                            expect(uu.api_refresh_token).to.not.be.null;
                            expect(uu.password).to.not.eq(oldPasswordHash);
                            done();
                        })
                        .then(null, (err) => done(err));
                })
        });

        it('should not update refresh token on every save', (done) => {
            return UserModel
                .create({
                    email: 'notUpdate@gmail.com',
                    password: '123456'
                })
                .then((u) => {
                    u.weight = 150;
                    u.save()
                        .then((uu) => {
                            expect(u.api_refresh_token).to.eq(uu.api_refresh_token);
                            expect(uu.api_refresh_token).to.not.be.null;
                            done();
                        })
                        .then(null, (err) => done(err));
                });
        });

        it('should hash plain password', () => {
            expect(testUser.password).to.not.be.null;
            expect(testUser.password).to.be.a('string');
            expect(testUser.password).length.to.be.above(12);
        });

        after((done) => {
            testUser = null;
            mongoose.connection.db.dropDatabase(done);
        });
    });

    after((done) => {
        testUser = null;
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});