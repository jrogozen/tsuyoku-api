import { userFactory, updateUserFactory } from '../../factories/user';
import { errors } from '../../constants';
import { expect } from 'chai';

describe('User Factory', () => {
    describe('userFactory', () => {
        it ('should error when bad arguments', () => {
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
                password: '123456'
            });

            expect(newUser.email).to.equal('mahalo@gmail.com');
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

    describe('updateUserFactory', () => {
        it('should error when bad arguments', () => {
            let noData = updateUserFactory();
            let badData = updateUserFactory('hello');
            let superBadData = updateUserFactory({});

            expect(noData.message).to.eq(errors.notEnoughData);
            expect(badData.message).to.eq(errors.notEnoughData);
            expect(noData.message).to.eq(errors.notEnoughData);
        });

        it('should remove bad keys from user object', () => {
            let updatedUser = updateUserFactory({email: 'mahalo@gmail.com', dumbo: true});
            
            expect(updatedUser.email).to.eq('mahalo@gmail.com');
            expect(updatedUser.dumbo).to.be.undefined;
        });

        it('should not update paid or admin status unless isAdmin', () => {
            let failUpdate = updateUserFactory({paid: true});
            let successUpdate = updateUserFactory({paid: true}, true);

            expect(failUpdate.paid).to.be.undefined;
            expect(successUpdate.paid).to.be.true;
        });

        it('should return updated user details', () => {
            let updatedUser = updateUserFactory({password: '654321', age: 25});

            expect(updatedUser.password).to.eq('654321');
            expect(updatedUser.age).to.eq(25);
        });
    });
});