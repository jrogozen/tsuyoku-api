import * as config from '../../../config';
import { inspect, expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';
import WorkoutModel from '../../../schemas/workout';

let testUser;
let routine = {
    name: '5/3/1',
    week: 2,
    options: {
        accessory: 'boring but big'
    }
};

describe('/guides - PUT', () => {
    before((done) => listen().then(() => {
        requester.post('/users')
            .send({
                email: 'jon.rogozen@gmail.com',
                password: '123456',
                maxes: {
                    bench_press: 225
                }
            })
            .end((err, res) => {
                testUser = res.body.data;
                done();
            });
    }));

    it('should return a guide with lifts based on user info', (done) => {
        requester.put('/guides')
            .send({ userId: testUser._id, routine: routine, maxes: { 'bench press': testUser.maxes.bench_press } })
            .set('x-access-token', testUser.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data.routine).to.be.an('object');
                expect(data.lifts['bench press'].sets.length).to.eq(3);
                expect(data.lifts['bench press'].warmup.length).to.eq(3);
                expect(data.lifts['bench press'].accessoryLifts['bench press'].sets.length).to.eq(5);
                expect(data.lifts['bench press'].accessoryLifts['dumbbell row'].sets.length).to.eq(5);
                expect(res.body.api_access_token).to.be.a('string');
                done();
            });
    });

    it('should error if not enough data', (done) => {
        requester.put('/guides')
            .send({ userId: testUser._id, routine: {} })
            .expect(500)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.notEnoughData);
                done();
            });
    });

    it('should error if no access token', (done) => {
        requester.put('/guides')
            .send({ userId: testUser._id, routine: {}, maxes: {} })
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should error if no authorization', (done) => {
        requester.put('/guides')
            .send({ userId: testUser._id, routine: {}, maxes: {} })
            .set('x-access-token', '55')
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.token);
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});