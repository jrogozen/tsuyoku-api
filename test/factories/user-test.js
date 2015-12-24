import userFactory from '../../factories/user';
import { errors } from '../../constants';
import { expect } from 'chai';

describe('User Factory', () => {
    it ('should return false when bad arguments', () => {
        let noUserData = userFactory();
        let badUserData = userFactory('Jon');
        let incompleteUserData = userFactory({email: 'jon@gmail.com'});
        let multipleUserData = userFactory([{email: 'jon@gmail.com'}, {email: 'dan@gmail.com'}]);

        expect(noUserData.message).to.eq(errors.notEnoughData);
        expect(badUserData.message).to.eq(errors.notEnoughData);
        expect(incompleteUserData.message).to.eq(errors.notEnoughData);
        expect(multipleUserData.message).to.eq(errors.notEnoughData);
    });

    it('should require a password over 6 characters', () => {
        let newUser = userFactory({
            email: 'mahalo@gmail.com',
            password: '123'
        });

        expect(newUser.message).to.eq(errors.passwordLength);
    });

    it ('should have correct values by default', () => {
        let newUser = userFactory({
            email: 'jon@gmail.com',
            password: '123456'
        });

        expect(newUser.admin).to.eq(false);
        expect(newUser.paid).to.eq(false);
        expect(newUser.api_refresh_token).to.be.null;
        expect(newUser.fitbit_refresh_token).to.be.null;
    });

    it ('should always return a new object', () => {
        let newUser1 = userFactory({email: 'jon@gmail.com', password: '123456'});
        let newUser2 = userFactory({email: 'dan@gmail.com', password: '123456'});

        expect(newUser1).to.not.equal(newUser2);
    });

    it ('should replace defaults with passed in data', () => {
        let newUser = userFactory({
            email: 'mahalo@gmail.com',
            password: '123456',
            paid: true
        });

        expect(newUser.paid).to.equal(true);
        expect(newUser.admin).to.equal(false);
    });

    it('should remove bad keys from user object', () => {
        let newUser = userFactory({
            email: 'mahalo@gmail.com',
            password: '123456',
            diet: 'strict',
            bool: false
        });

        expect(newUser.email).to.equal('mahalo@gmail.com');
        expect(newUser.diet).to.be.undefined;
        expect(newUser.bool).to.be.undefined;
    });

    it('should define me as admin', () => {
        let newUser = userFactory({
            email: 'jon.rogozen@gmail.com',
            password: '123456'
        });

        expect(newUser.admin).to.be.true;
        expect(newUser.paid).to.be.true;
    });
});