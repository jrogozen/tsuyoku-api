import errorCheck from '../../utils/errorCheck';
import { expect } from 'chai';

describe('Error Check', () => {
    it ('should only check objects', () => {
        let errorArray = errorCheck([new Error('hey')]);
        let errorString = errorCheck('hey');

        expect(errorArray).to.eq(false);
        expect(errorString).to.eq(false);
    });

    it ('should return an existing error', () => {
        let existingErr = new Error('original error');
        let newErr = new Error('new error');
        let error = errorCheck(newErr, existingErr);

        expect(error.message).to.eq('original error');
    });

    it ('should return an error', () => {
        let err = new Error('my error');
        let error = errorCheck(err);

        expect(error.message).to.eq('my error');
    });

    it ('should return null if no error', () => {
        let err = {email: 'mahalo@gmail.com'};
        let error = errorCheck(err);

        expect(error).to.be.null;
    });
});