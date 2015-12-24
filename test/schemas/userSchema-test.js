import { expect, supertest, mongoose, App, listen, close, server, errors, requester } from '../bootstrapTest';
import UserModel from '../../schemas/user';

let testUser;

describe('User Schema', () => {
    before((done) => listen().then(() => done()));

    describe('comparePassword', () => {
        before((done) => {
            UserModel.create({
                email: 'mahalo@gmail.com',
                password: '123456'
            }, (err, u) => {
                testUser = u;
                done();
            });
        });

        it('should error if no pw or cb', () => {
            let noData = testUser.comparePassword();
            let noCb = testUser.comparePassword('test');

            expect(noData.message).to.eq(errors.notEnoughData);
            expect(noCb.message).to.eq(errors.notEnoughData);
        });

        it('should correctly decode a password', (done) => {
            let compare = testUser.comparePassword('123456', (err, isMatch) => {
                expect(err).to.be.null;
                expect(isMatch).to.be.true;
                done();
            })
        });

        it('should correctly error if wrong password', (done) => {
            let badCompare = testUser.comparePassword('12345', (err, isMatch) => {
                expect(err).to.be.null;
                expect(isMatch).to.be.false;
                done();
            });
        });

        after((done) => {
            testUser = null;
            mongoose.connection.db.dropDatabase(done);
        });
    });

    // describe('compareRrefreshToken', () => {
    //     it('should error when no ')
    // });

    describe.only('pre save', () => {
        before((done) => {
            UserModel.create({
                email: 'mahalo@gmail.com',
                password: '123456'
            }, (err, u) => {
                testUser = u;
                done();
            });
        });

        it('should save a created_at and updated_at string on create', () => {
            expect(testUser.created_at).to.not.be.null;
            expect(testUser.created_at).to.be.a('number');
            expect(testUser.created_at).to.eq(testUser.updated_at);
        });

        it('should not update created_at on subsequent saves', (done) => {
            return UserModel
                .findOne({
                    email: 'mahalo@gmail.com'
                })
                .exec()
                .then((u) => {
                    u.age = 26;
                    u.save()
                        .then((uu) => {
                            expect(u.email).to.eq('mahalo@gmail.com');
                            expect(u.age).to.eq(26);
                            expect(u.created_at).to.be.below(u.updated_at);
                            done();
                        })
                        .then(null, (err) => done(err));
                });
        });

        xit('should save a refresh token on create', (done) => {

        });

        xit('should update to new refresh token on pw change', (done) => {

        });

        xit('should not update refresh token on every save', (done) => {

        });

        xit('should hash plain password', (done) => {

        });

        after((done) => {
            testUser = null;
            mongoose.connection.db.dropDatabase(done);
        });
    });

    after((done) => {
        testUser = null;
        mongoose.connection.db.dropDatabase();
        close(done);
    });
});