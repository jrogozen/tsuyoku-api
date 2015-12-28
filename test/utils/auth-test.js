import * as config from '../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../bootstrapTest';
import { authorize } from '../../utils/auth';
import UserModel from '../../schemas/user';

let testAdmin;
let testUser;

describe('Auth Util', () => {
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

    describe('authorize', () => {
        it('should error if not enough data', (done) => {
            authorize().catch((err) => {
                expect(err.message).to.eq(errors.notEnoughData);
            });

            authorize('123').catch((err) => {
                expect(err.message).to.eq(errors.notEnoughData);
                done();
            });
        });

        it('should return true if admin', (done) => {
            authorize('123', testAdmin._id).then((res) => {
                expect(res).to.eq(true);
                done();
            })
        });

        it('should return true if not admin and ids match', (done) => {
            authorize(testUser._id, testUser._id).then((res) => {
                expect(res).to.eq(true);
                done();
            });
        });

        it('should error if token sucks', () => {
            authorize('123', '456').catch((err) => {
                expect(err.message).to.eq(errors.noAuthorization);
                done();
            });
        });

        it('should error if not admin and ids do not match', () => {
            authorize(testAdmin._id, testUser._id).catch((err) => {
                expect(err.message).to.eq(errors.noAuthorization);
                done();
            });
        });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});