import * as config from '../../../config';
import { inspect, expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';

let testUser;

describe.only('Auth Routes', () => {
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

        xit('should return user info, api_access_token, and refresh_token on api_access_token', () => {

        });

        xit('should return user info, api_access_token, and refresh_token on refresh_token', () => {

        });

        xit('should error if pw does not match db', () => {

        });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});