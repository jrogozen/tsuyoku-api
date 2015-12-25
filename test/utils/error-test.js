import { errorCheck, createError } from '../../utils/error';
import { expect } from 'chai';

describe('Error Utils', () => {
    describe('errorCheck', () => {
        it('should only check objects', () => {
            let errorArray = errorCheck([new Error('hey')]);
            let errorString = errorCheck('hey');

            expect(errorArray).to.eq(false);
            expect(errorString).to.eq(false);
        });

        it('should return an error', () => {
            let err = new Error('my error');
            let error = errorCheck(err);

            expect(error.message).to.eq('my error');
        });

        it('should return null if no error', () => {
            let err = {email: 'mahalo@gmail.com'};
            let error = errorCheck(err);

            expect(error).to.be.null;
        });
    });

    describe('createError', () => {
        it('should return false if no message', () => {
            let err = createError();

            expect(err).to.be.false;
        });

        it('should, set a default status', () => {
            let err = createError('oops');

            expect(err.status).to.eq(500);
        });

        it('should return an error', () => {
            let err = createError('my error');

            expect(err.name).to.eq('Error');
            expect(err.message).to.eq('my error');
        });
    });
});