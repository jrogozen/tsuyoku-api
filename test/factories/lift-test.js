import { liftFactory } from '../../factories/lift';
import { errors } from '../../constants';
import { expect } from 'chai';

describe('Lift Factory', () => {
    describe('liftFactory', () => {
        it('should error if not enough data', () => {
            let noLift = liftFactory();
            let noName = liftFactory({ weight: [123] });
            let noWeight = liftFactory({ name: 'Bench Press', weight: 125 });

            expect(noLift.message).to.eq(errors.notEnoughData);
            expect(noName.message).to.eq(errors.notEnoughData);
            expect(noWeight.message).to.eq(errors.notEnoughData);
        });

        it('should return a lift with name and weight', () => {
            let lift = liftFactory({ name: 'bench_press', weight: [125, 150] });

            expect(lift.name).to.eq('bench_press');
            expect(lift.weight).to.be.an('array');
            expect(lift.weight).to.have.members([125, 150]);
        });
    });
});