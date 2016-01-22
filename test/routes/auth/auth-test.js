import * as config from '../../../config';
import { inspect, expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;

describe('Auth Routes', () => {
    before((done) => {
        listen().then(() => {
            requester.post('/users')
                .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
                .end((err, res) => {
                    testUser = res.body.data;
                    done();
                });
        });
    });

    describe('/login - POST', () => {
        it('should return user info, api_access_token, and refresh_token on email/pw', (done) => {
            requester.post('/login')
                .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let data = res.body.data;

                    expect(err).to.be.null;
                    expect(res.body.success).to.be.true;
                    expect(res.body.api_access_token).to.be.a('string');
                    expect(data.api_refresh_token).to.be.a('string');
                    expect(data.password).to.be.undefined;
                    expect(data._id).to.eq(testUser._id);
                    expect(data.email).to.eq(testUser.email);
                    done();
                });
        });

        it('should return user info, api_access_token, and refresh_token on refresh_token', (done) => {
            requester.post('/login')
                .send({ api_refresh_token: testUser.api_refresh_token, userId: testUser._id })
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let data = res.body.data;

                    expect(err).to.be.null;
                    expect(res.body.success).to.be.true;
                    expect(res.body.api_access_token).to.be.a('string');
                    expect(data.api_refresh_token).to.be.a('string');
                    expect(data.password).to.be.undefined;
                    expect(data._id).to.eq(testUser._id);
                    expect(data.email).to.eq(testUser.email);
                    done();
                });
        });

        it('should return user info, api_access_token, and refresh_token on api_access_token', (done) => {
            requester.post('/login')
                .set('x-access-token', testUser.api_access_token)
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let data = res.body.data;

                    expect(err).to.be.null;
                    expect(res.body.success).to.be.true;
                    expect(res.body.api_access_token).to.be.a('string');
                    expect(data.api_refresh_token).to.be.a('string');
                    expect(data.password).to.be.undefined;
                    expect(data._id).to.eq(testUser._id);
                    expect(data.email).to.eq(testUser.email);
                    done();
                });
        });

        it('should error if refresh_token but no userId', (done) => {
            requester.post('/login')
                .send({ api_refresh_token: testUser.api_refresh_token })
                .expect(500)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.body.success).to.be.false;
                    expect(res.body.error).to.eq(errors.notEnoughData);
                    done();
                });
        });

        it('should error if no matching user w/ email', (done) => {
            requester.post('/login')
                .send({ email: 'mongaloid@gmail.com', password: '123456' })
                .expect(404)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.body.success).to.be.false;
                    expect(res.body.error).to.eq(errors.noMatchingRecord);
                    done();
                });
        });

        it('should error if no matching user w/ userId', (done) => {
            requester.post('/login')
                .send({ api_refresh_token: testUser.api_refresh_token, userId: testUser._id.replace(/\w/g, '1') })
                .expect(404)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    expect(err).to.be.null
                    expect(res.body.success).to.be.false;
                    expect(res.body.error).to.eq(errors.noMatchingRecord);
                    done();
                });
        });

        it('should error if pw does not match db', (done) => {
            requester.post('/login')
                .send({ email: 'jon.rogozen@gmail.com', password: '111111' })
                .expect(402)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    inspect(res.body);
                    expect(err).to.be.null
                    expect(res.body.success).to.be.false;
                    expect(res.body.error).to.eq(errors.noAuthorization);
                    done();
                });
        });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});