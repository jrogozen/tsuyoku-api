import { expect, supertest, mongoose, App, listen, close, server, errors, defaultAccessToken, requester } from '../bootstrapTest';
import WorkoutModel from '../../schemas/workout';

let testWorkout;

describe('Workout Schema', () => {
    before((done) => listen().then(() => done()));

    describe('pre save', () => {
        before((done) => {
            WorkoutModel.create({
                routine: {
                    name: '5/3/1',
                    week: 1
                },
                lifts: [{ name: 'bench press', weight: [135, 225, 305] }],
                userId: new mongoose.Types.ObjectId
            }, (err, w) => {
                testWorkout = w;
                done();
            });
        });

        it('should save a created_at and updated_at date number on create', () => {
            expect(testWorkout.created_at).to.not.be.null;
            expect(testWorkout.created_at).to.be.a('number');
            expect(testWorkout.updated_at).to.eq(testWorkout.created_at);
        });

        it('should save a userId', () => {
            expect(testWorkout.userId).to.not.be.null;
            expect(testWorkout.userId).to.be.an.instanceOf(mongoose.Types.ObjectId);
        });

        it('should not override created_at passed in', (done) => {
            let workout;

            WorkoutModel.create({
                routine: {
                    name: '5/3/1',
                    week: 1
                },
                created_at: 99,
                lifts: [{ name: 'bench press', weight: [135, 225, 305] }],
                userId: new mongoose.Types.ObjectId
            }, (err, w) => {
                workout = w;

                expect(workout.created_at).to.not.be.null;
                expect(workout.created_at).to.not.eq(workout.updated_at);
                done();
            });

        });
    });

    after((done) => {
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});