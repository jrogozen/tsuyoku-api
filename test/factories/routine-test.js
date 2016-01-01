import { routineFactory } from '../../factories/routine';
import { errors } from '../../constants';
import { expect } from 'chai';

describe('Routine Factory', () => {
    describe('routineFactory', () => {
        it('should error when not enough data', () => {
            let noData = routineFactory();
            let noName = routineFactory({ week: 3, options: {} });

            expect(noData.message).to.eq(errors.notEnoughData);
            expect(noName.message).to.eq(errors.notEnoughData);
        });

        it('should correctly set defaults', () => {
            let routine = routineFactory({ name: '5/3/1' });

            expect(routine.name).to.eq('5/3/1');
            expect(routine.week).to.eq(1);
        });

        it('should return a new routine object', () => {
            let routine = routineFactory({ name: '5/3/1', week: 14, options: { accessory: 'boring but big', deload: false } });

            expect(routine.name).to.eq('5/3/1');
            expect(routine.week).to.eq(14);
        });

        it('should require an existing routine name', () => {
            let routine = routineFactory({ name: '5/50/10' });

            expect(routine.message).to.eq(errors.notEnoughData);
        });

        // don't really care about removing invalid params, since they'll get deleted by mongoose schema
    });
});