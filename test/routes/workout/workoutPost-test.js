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

describe('/workout - POST', () => {
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
            .send(thisWorkout)
            .expect('Content-type', /json/)
            .expect(402)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthorization);
                done();
            });
    });

    it('should save workout to db', (done) => {
        let workoutId;
        let thisWorkout = Object.assign({}, workoutDetails);
        thisWorkout.userId = testUser._id;

        requester.post('/workouts/')
            .set('x-access-token', testUser.api_access_token)
            .send(thisWorkout)
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                workoutId = res.body.data._id;
                expect(err).to.be.null;
                expect(res.body.success).to.be.true;

                WorkoutModel.findOne({ _id: workoutId })
                    .then((w) => {
                        expect(w).to.not.be.null;
                        expect(String(w._id)).to.eq(workoutId);
                        expect(w.lifts).to.be.an('array');
                        expect(w.accessory_lifts).to.be.an('array');
                        expect(w.routine).to.be.an('object');
                        expect(w.routine.name).to.eq(workoutDetails.routine.name);
                        done();
                    });
            })
    });

    it('should return a workout object w/ api_access_token', (done) => {
        let workoutId;
        let thisWorkout = Object.assign({}, workoutDetails);
        thisWorkout.userId = testUser._id;

        requester.post('/workouts/')
            .set('x-access-token', testUser.api_access_token)
            .send(thisWorkout)
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(res.body.api_access_token).to.be.a('string');
                expect(data.lifts).to.be.an('array');
                expect(data.accessory_lifts).to.be.an('array');
                expect(data.routine).to.be.an('object');
                expect(data._id).to.be.a('string');
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});