import mongoose from 'mongoose';

import { workoutFactory } from '../../factories/workout';
import { errors } from '../../constants';
import { expect } from 'chai';

describe('Workout Factory', () => {
    describe('workoutFactory', () => {
        it('should error when not enough data', () => {
            let noData = workoutFactory();
            let noLifts = workoutFactory({ routine: { name: '5/3/1' } });
            let noRoutine = workoutFactory({ lifts: [] });
            let noUserId = workoutFactory({ routine: { name: '5/3/1' }, lifts: [] });

            expect(noData.message).to.eq(errors.notEnoughData);
            expect(noLifts.message).to.eq(errors.notEnoughData);
            expect(noRoutine.message).to.eq(errors.notEnoughData);
            expect(noUserId.message).to.eq(errors.notEnoughData);
        });

        it('should return a new workout object', () => {
            let workout = workoutFactory({
                routine: {
                    name: '5/3/1'
                },
                lifts: [{
                    name: 'bench press',
                    weight: [225, 250, 265]
                }],
                userId: new mongoose.Types.ObjectId
            });

            expect(workout.routine).to.be.an('object');
            expect(workout.lifts).to.be.an('array');
            expect(workout.lifts.length).to.eq(1);
        });

        it('should require lifts and accessory lifts to be arrays', () => {
            let failLifts = workoutFactory({
                routine: {
                    name: '5/3/1'
                },
                lifts: { name: 'bench press', weight: [100, 150, 0] },
                userId: new mongoose.Types.ObjectId
            });
            let failAccessoryLifts = workoutFactory({
                routine: {
                    name: '5/3/1'
                },
                userId: new mongoose.Types.ObjectId
            })

            expect(failLifts.message).to.eq(errors.notEnoughData);
            expect(failAccessoryLifts.message).to.eq(errors.notEnoughData);
        });
    });
});