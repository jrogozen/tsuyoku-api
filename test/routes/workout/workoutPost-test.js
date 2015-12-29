import jwt from 'jsonwebtoken';

import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';
import WorkoutModel from '../../../schemas/workout';

let workoutDetails = {
    routine: {
        name: '5/3/1',
        week: 2,
        options: {
            accessory: 'boring but big'
        }
    },
    lifts: [{ name: 'bench press', weight: [ 115, 115, 115, 115, 115, 225, 225, 225 ] }],
    accessory_lifts: [{ name: 'bench press', weight: [140] }],
    userId: new mongoose.Types.ObjectId
};
let testUser;
let testAdmin;

describe.only('/workout - POST', () => {
    before((done) => listen().then(() => {
        requester.post('/users/')
            .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
            .end((err, res) => {
                testAdmin = res.body.data;
                requester.post('/users/')
                    .send({ email: 'mahalo@gmail.com', password: '654321' })
                    .end((err, res) => {
                        testUser = res.body.data;
                        done();
                    });
            });
    }));

    it('should error if not enough data', (done) => {
        requester.post('/workouts/')
            .expect('Content-type', /json/)
            .expect(500)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.notEnoughData);
                done();
            });

    });

    it('should error if no api access token', (done) => {
        requester.post('/workouts/')
            .send(workoutDetails)
            .expect('Content-type', /json/)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should error if no authorization', (done) => {
        let thisWorkout = Object.assign({}, workoutDetails);
        thisWorkout.userId = testAdmin._id;

        requester.post('/workouts/')
            .set('x-access-token', testUser.api_access_token)
            .send(workoutDetails)
            .expect('Content-type', /json/)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthorization);
                done();
            });
    });

    xit('should save workout to db', () => {

    });

    xit('should return a workout object', () => {

    });

    xit('should return an api token', () => {

    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});