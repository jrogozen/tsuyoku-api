import { guideFactory } from '../../factories/guide';
import { errors } from '../../constants';
import { inspect } from '../../utils/generic';
import { expect } from 'chai';

describe('Guide Factory', () => {
    describe('guideFactory - 5/3/1', () => {
        it('should return a guide with lifts and routine', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 1
                },
                maxes: {
                    'bench press': 200,
                    'deadlift': 200
                }
            };
            let guide = guideFactory(guideDetails);

            expect(guide.routine).to.be.an('object');
            expect(guide.routine.name).to.eq('5/3/1');
            expect(guide.lifts).to.be.an('object');
            expect(guide.lifts['bench press']).to.be.an('object');
            expect(guide.lifts['bench press'].warmup).to.be.an('array');
            expect(guide.lifts['deadlift'].warmup).to.be.an('array');
            expect(guide.lifts['deadlift'].sets).to.be.an('array');
            expect(guide.lifts['deadlift'].sets[0][0]).to.eq(115);
            expect(guide.lifts['deadlift'].sets[1][0]).to.eq(135);
            expect(guide.lifts['deadlift'].sets[2][0]).to.eq(155);
            expect(guide.lifts['deadlift'].warmup[0][0]).to.eq(70);
            expect(guide.lifts['deadlift'].warmup[1][0]).to.eq(90);
            expect(guide.lifts['deadlift'].warmup[2][0]).to.eq(110);
            expect(guide.lifts['deadlift'].warmup[0].length).to.eq(5);
            expect(guide.lifts['deadlift'].warmup[1].length).to.eq(5);
            expect(guide.lifts['deadlift'].warmup[2].length).to.eq(3);
            expect(guide.lifts['deadlift'].sets[0].length).to.eq(5);
            expect(guide.lifts['bench press'].sets[1].length).to.eq(5);
            expect(guide.lifts['bench press'].sets[2].length).to.eq(5);
        });

        it('should return the correct lifts based on week', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 3
                },
                maxes: {
                    'bench press': 200,
                }
            };
            let guide = guideFactory(guideDetails);

            expect(guide.routine.name).to.eq('5/3/1');
            expect(guide.lifts['bench press'].warmup[0][0]).to.eq(70);
            expect(guide.lifts['bench press'].sets[0][4]).to.eq(135);
            expect(guide.lifts['bench press'].sets[2][0]).to.eq(170);
            expect(guide.lifts['bench press'].sets[2].length).to.eq(1);
        });

        it('should return no lifts for week 4', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 4
                },
                maxes: {
                    'bench press': 200,
                }
            };
            let guide = guideFactory(guideDetails);

            expect(guide.routine.name).to.eq('5/3/1');
            expect(guide.lifts['bench press'].warmup[0][0]).to.eq(70);
            expect(guide.lifts['bench press'].sets).to.be.an('array');
            expect(guide.lifts['bench press'].sets.length).to.eq(0);
        });

        it('should provide boring but big accessory lifts when in options', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 1,
                    options: {
                        accessory: 'boring but big'
                    }
                },
                maxes: { 'bench press': 200 },
            };
            let guide = guideFactory(guideDetails);

            expect(guide.lifts['bench press'].accessoryLifts['bench press'].sets).to.be.an('array');
            expect(guide.lifts['bench press'].accessoryLifts['bench press'].sets[0][0]).to.eq(90);
            expect(guide.lifts['bench press'].accessoryLifts['bench press'].sets.length).to.eq(5);
            expect(guide.lifts['bench press'].accessoryLifts['dumbbell row'].sets.length).to.eq(5);
            expect(guide.lifts['bench press'].accessoryLifts['dumbbell row'].sets[0][0]).to.eq(0);
        });

        it('boring but big lifts should increment per month', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 5,
                    options: {
                        accessory: 'boring but big'
                    }
                },
                maxes: { 'press': 200 },
            };
            let guide = guideFactory(guideDetails);

            expect(guide.lifts['press'].accessoryLifts['press'].sets).to.be.an('array');
            expect(guide.lifts['press'].accessoryLifts['press'].sets[0][0]).to.eq(110);
            expect(guide.lifts['press'].accessoryLifts['press'].sets.length).to.eq(5);
            expect(guide.lifts['press'].accessoryLifts['chin-up'].sets.length).to.eq(5);
            expect(guide.lifts['press'].accessoryLifts['chin-up'].sets[0][0]).to.eq(0);
        });

        it('boring but big lifts should correspond to correct lift type', () => {
            let guideDetails = {
                routine: {
                    name: '5/3/1',
                    week: 2,
                    options: {
                        accessory: 'boring but big'
                    }
                },
                maxes: { 'deadlift': 200 },
            };
            let guide = guideFactory(guideDetails);

            expect(guide.lifts['deadlift'].accessoryLifts['deadlift'].sets[0][0]).to.eq(90);
            expect(guide.lifts['deadlift'].accessoryLifts['hanging leg raise'].sets.length).to.eq(5);
            expect(guide.lifts['deadlift'].accessoryLifts['hanging leg raise'].sets[0].length).to.eq(15);
        });

        it('should error when not enough data', () => {
            let noMaxDetails = {
                routine: {
                    name: '5/3/1',
                    week: 2
                }
            };
            let noRoutineDetails = {
                maxes: { 'deadlift' : 200 }
            };

            let noMax = guideFactory(noMaxDetails);
            let noRoutine = guideFactory(noRoutineDetails);

            expect(noMax.message).to.eq(errors.notEnoughData);
            expect(noRoutine.message).to.eq(errors.notEnoughData);
        });

        xit('should return correct total weight (warmups + main lifts + accessory lifts)', () => {

        });
    });
});