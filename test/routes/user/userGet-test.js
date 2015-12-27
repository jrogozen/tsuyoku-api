import jwt from 'jsonwebtoken';
import promise from 'promise';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;

let postUser = function postUser(email) {
    return new promise((resolve, reject) => {
        requester
            .post('/users/')
            .send({email: email, password: '123456'})
            .end((err, res) => resolve(res));
    });
};

let massPostUser = function massPostUser(base, count) {
    let userArray = [];
    let baseEmail = base || 'moomoo';

    for (let i = 0; i < count; i++) {
        userArray.push(
            postUser(baseEmail + i + '@gmail.com')
        );
    }

    return userArray;
}

describe('/users - GET', () => {
    before((done) => listen().then(() => {
        requester
            .post('/users/')
            .send({email: 'mahalo@gmail.com', password: '123456'})
            .end((err, res) => {
                testUser = res.body.data;
                done();
            });
    }));

    it('should fail if not authenticated (token)', (done) => {
        requester
            .get('/users/')
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.eq(false);
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            })

    });

    it('should return an aray of users', (done) => {
        requester
            .get('/users/')
            .set('x-access-token', testUser.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let userArray = res.body.data.users;

                expect(err).to.be.null;
                expect(userArray).to.be.an('array');
                expect(userArray.length).to.eq(1);
                done();
            });
    });

    it('should only return up to 10 users at a time', (done) => {
        let pArray = massPostUser('moomoo', 15);

        promise.all(pArray).then(() => {
            requester
                .get('/users/')
                .set('x-access-token', testUser.api_access_token)
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let userArray = res.body.data.users;
                    let count = res.body.data.totalUsers;

                    expect(err).to.be.null;
                    expect(userArray).to.be.an('array');
                    expect(userArray.length).to.eq(10);
                    expect(count).to.be.above(15);
                    done();
                });
        });
    });

    it('should accept a skip parameter', (done) => {
        requester
            .get('/users/')
            .query({
                skip: 10
            })
            .set('x-access-token', testUser.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let userArray = res.body.data.users;
                let count = res.body.data.totalUsers;

                expect(err).to.be.null;
                expect(userArray).to.be.an('array');
                expect(userArray.length).to.eq(count - 10);
                done();
            });
    });

    it('should accept a limit parameter', (done) => {
        requester
            .get('/users/')
                .query({
                    limit: 1
                })
                .set('x-access-token', testUser.api_access_token)
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let userArray = res.body.data.users;

                    expect(err).to.be.null;
                    expect(userArray).to.be.an('array');
                    expect(userArray.length).to.eq(1);
                    done();
                });
    });

    // timeouts ensure a new token is signed
    it('response should include a new access token', (done) => {
        setTimeout(() => {
            requester
                .get('/users/')
                .set('x-access-token', testUser.api_access_token)
                .expect(200)
                .expect('Content-type', /json/)
                .end((err, res) => {
                    let body = res.body;

                    expect(err).to.be.null;
                    expect(body.api_access_token).to.be.a('string');
                    expect(body.api_access_token).to.not.eq(testUser.api_access_token);
                    done();
                });
        }, 1000)
    });

    after((done) => {
        testUser = null;
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});