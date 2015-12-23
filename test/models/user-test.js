import User from '../../models/user';
import { expect } from 'chai';

describe('User', () => {
    it ('should return false when bad arguments', () => {
        let noUserData = User();
        let badUserData = User('Jon');
        let multipleUserData = User([{email: 'jon@gmail.com'}, {email: 'dan@gmail.com'}]);

        expect(noUserData).to.eq(false);
        expect(badUserData).to.eq(false);
        expect(multipleUserData).to.eq(false);
    });

    it ('should have no user info by default', () => {
        let newUser = User({});

        expect(newUser.admin).to.eq(false);
        expect(newUser.paid).to.eq(false);
        expect(newUser.apiToken).to.be.null;
        expect(newUser.fitbitToken).to.be.null;
        expect(newUser.fitbitRefreshToken).to.be.null;
        expect(newUser.uuid).to.be.null;
    });

    it ('should always return a new object', () => {
        let newUser1 = User({});
        let newUser2 = User({});

        expect(newUser1).to.not.equal(newUser2);
    });

    it ('should replace defaults with passed in data', () => {
        let newUser = User({
            uuid: '1337',
            paid: true
        });

        expect(newUser.paid).to.equal(true);
        expect(newUser.admin).to.equal(false);
        expect(newUser.uuid).to.equal('1337');
    });
});