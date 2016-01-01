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
        week: 2,
        options: {
            accessory: 'boring but big'
        }
    },
    lifts: [{ name: 'bench press', weight: [ 115, 115, 115, 115, 115, 225, 225, 225 ] }],
    userId: null
};

describe('/workouts/:id - GET', () => {
    before((done) => {
        listen().then(() => {
            requester.post('/users/')
                .send({ email: 'mahalo@gmail.com', password: '123456' })
                .end((err, res) => {
                    testUser = res.body.data;
                    requester.post('/users/')
                        .send({ email: 'jon.rogozen@gmail.com', password: '123456' })
                        .end((err, res) => {
                            let newWorkoutDetails = Object.assign({}, workoutDetails);
                            testAdmin = res.body.data;
                            newWorkoutDetails.userId = testAdmin._id;

                            requester.post('/workouts/')
                                .set('x-access-token', testAdmin.api_access_token)
                                .send(newWorkoutDetails)
                                .end((err, res) => {
                                    testWorkout = res.body.data;
                                    done();
                                });
                        });
                });
        });
    });

    it('should error if no workout exists with matching id', (done) => {
        requester.get('/workouts/125')
            .set('x-access-token', testAdmin.api_access_token)
            .expect(500)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.couldNotProcessRequest);
                done();
            })
    });

    it('should error if bogus id', (done) => {
        requester.get('/workouts/11111d15cc60fa9d120b82dc')
            .set('x-access-token', testAdmin.api_access_token)
            .expect(404)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noMatchingRecord);
                done();
            })
    });

    it('should error if no access token', (done) => {
        requester.get('/workouts/' + testWorkout._id)
            .expect(402)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.eq(errors.noAuthentication);
                done();
            });
    });

    it('should return a matching workout object w/ api_access_token', (done) => {
        requester.get('/workouts/' + testWorkout._id)
            .set('x-access-token', testAdmin.api_access_token)
            .expect(200)
            .expect('Content-type', /json/)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.body.success).to.be.true;
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.routine).to.be.an('object');
                expect(res.body.data.lifts).to.be.an('array');
                expect(res.body.data.userId).to.eq(testAdmin._id);
                expect(res.body.api_access_token).to.be.a('string');
                done();
            });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    })
});