import * as config from '../../../config';
import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../../bootstrapTest';
import UserModel from '../../../schemas/user';
import WorkoutModel from '../../../schemas/workout';

let testAdmin;
let testUser;
let testWorkout;

let workoutDetails = {
    routine: {
        name: '5/3/1',
        week: 2
    },
    lifts: [{ name: 'bench press', weight: [ 115, 115, 115, 115, 115, 225, 225, 225 ] }],
    userId: null
};

let shuffle = function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

let getRandom = function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

let getManyRandoms = function getManyRandoms(min, max) {
    let arr = [];
    arr.length = getRandom(1,10);

    for (let i = 0; i < arr.length; i++) {
        arr[i] = getRandom(min, max);
    }

    return arr;
}

let createRoutine = function createRoutine() {
    let one = {
        name: '5/3/1',
        week: getRandom(1,52)
    };
    let two = {
        name: '5x5',
        week: getRandom(1,52)
    };
    let three = {
        name: '3x5',
        week: getRandom(1,52)
    };

    let arr = [one, two, three];

    return arr[getRandom(0,2)];
};

let createLifts = function createLifts() {
    let one = {
        name: 'bench press',
        weight: getManyRandoms(135, 325)
    };
    let two = {
        name: 'deadlift',
        weight: getManyRandoms(225, 325)
    };
    let three = {
        name: 'press',
        weight: getManyRandoms(85, 155)
    };
    let four = {
        name: 'squat',
        weight: getManyRandoms(135, 350)
    };
    let liftNum = getRandom(1,4);
    let allLifts = shuffle([one, two, three, four]);
    let lifts = [];

    for (let i = 0; i < liftNum; i++) {
        lifts.push(allLifts[i]);
    }

    return lifts;
};

let createWorkout = function createWorkout(times, done) {
    let timeLeft = times;
    let workout = {
        routine: createRoutine(),
        lifts: createLifts(),
        userId: getRandom(1,4) % 2 === 0 ? testAdmin._id : testUser._id
    };
    requester.post('/workouts/')
        .set('x-access-token', testAdmin.api_access_token)
        .send(workout)
        .end((err, res) => {
            if (timeLeft > 1) {
                createWorkout(times - 1, done);
            } else {
                done();
            }
        })

};

describe('/workouts/byId - GET', () => {
    before((done) => {
        listen().then(() => {
            requester.post('/users/')
                .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
                .end((err, res) => {
                    testAdmin = res.body.data;

                    requester.post('/users/')
                        .send({ email: 'mahalo@gmail.com', password: '123456' })
                        .end((err, res) => {
                            testUser = res.body.data;

                            createWorkout(20, done);
                        });
                });
        });
    });

    it('should error if not enough data', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testUser._id
            })
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
        requester.get('/workouts/byUser')
            .query({
                userId: testUser._id,
                routineName: '5/3/1'
            })
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should error if not authorized', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '5/3/1'
            })
            .set('x-access-token', testUser.api_access_token)
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthorization);
                done();
            });
    });

    it('should filter by routine name', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '5/3/1'
            })
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data).to.be.an('array');

                data.forEach((workout) => {
                    expect(workout.routine.name).to.eq('5/3/1');
                });

                done();
            });
    });

    it('should filter by lift name', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '5/3/1',
                liftName: 'bench press'
            })
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data).to.be.an('array');

                data.forEach((workout) => {
                    workout.lifts.forEach((lift) => {
                        expect(lift.name).to.eq('bench press');
                    });
                });

                done();
            });
    });

    it('should filter by limit. limit refers to routines returned for that user', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '5/3/1',
                liftName: 'bench press',
                limit: 1
            })
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data).to.be.an('array');
                expect(data.length).to.be.below(2);

                if (data.length > 0) {
                    data[0].lifts.forEach((lift) => {
                        expect(lift.name).to.eq('bench press');
                    });
                }

                done();
            });
    });

    it('should sort by created_at, desc', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '5/3/1'
            })
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data).to.be.an('array');

                if (data.length > 0) {
                    let prevCreated;

                    data.forEach((workout) => {
                        if (!prevCreated) {
                            prevCreated = workout.created_at;
                        } else {
                            expect(workout.created_at).to.be.below(prevCreated);
                            prevCreated = workout.created_at;
                        }
                    });
                }

                done();
            });
    });

    it('should return workouts with access_token ', (done) => {
        requester.get('/workouts/byUser')
            .query({
                userId: testAdmin._id,
                routineName: '3x5'
            })
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                let data = res.body.data;

                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(data).to.be.an('array');
                expect(res.body.api_access_token).to.be.a('string');
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});