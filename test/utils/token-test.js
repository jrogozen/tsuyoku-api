import { expect } from 'chai';
import jwt from 'jsonwebtoken';

import { errors } from '../../constants';
import { generateRefreshToken, generateAccessToken, processAccessToken } from '../../utils/token';

const TEST_SECRET = 'supersecret';

describe('Token Util', () => {
    describe('generateRefreshToken', () => {
        it('should error when no id', () => {
            let getToken = generateRefreshToken('desktop');

            expect(getToken.message).to.eq(errors.token);
            expect(getToken.name).to.eq('Error');
        });

        it('should provide a default device type', () => {
            let getToken = generateRefreshToken(null, '110');

            expect(getToken).to.contain('default');
        });

        it('token should include device and id', () => {
            let getToken = generateRefreshToken('ios', '337');
            let split = getToken.split(';')[1].split('-');
            let id = split[1];
            let device = split[0];

            expect(id).to.eq('337');
            expect(device).to.eq('ios');
        });

        it('should create a random string', () => {
            let getToken = generateRefreshToken(null, '17');
            let getTokenTwo = generateRefreshToken(null, '17');

            expect(getToken).to.not.eq(getTokenTwo);
            expect(getToken).to.have.length.above(14);
            expect(getTokenTwo).to.have.length.above(14);
        });
    });

    describe('generateAccessToken', () => {
        it('should error when no user or secret', () => {
            let getToken = generateAccessToken();
            let getTokenTwo = generateAccessToken({email: 'jon'}, TEST_SECRET);

            expect(getToken.message).to.eq(errors.token);
            expect(getToken.name).to.eq('Error');
            expect(getTokenTwo.message).to.eq(errors.token);
            expect(getTokenTwo.name).to.eq('Error');
        });

        it('should return an encoded token', () => {
            let getToken = generateAccessToken({_id: '1241021'}, TEST_SECRET);

            expect(getToken).to.be.a('string');
            expect(getToken).to.have.length.above(100);
        });

        it('decoded token should have correct body', (done) => {
            let getToken = generateAccessToken({_id: '15'}, TEST_SECRET);

            jwt.verify(getToken, TEST_SECRET, (err, decoded) => {
                let expTime = decoded.exp - decoded.iat;

                expect(err).to.be.null;
                expect(decoded).to.be.an('object');
                expect(decoded.iss).to.eq('tsuyoku-api');
                expect(expTime).to.eq(1200);
                expect(decoded.sub).to.eq('15');
                done();
            });
        });
    });

    describe('processAccessToken', () => {
        it('should error if no access token or secret', () => {
            let getToken = processAccessToken();
            let getTokenTwo = processAccessToken('fakeEncode');
            let getTokenThree = processAccessToken(null, TEST_SECRET);

            expect(getToken.message).to.eq(errors.token);
            expect(getTokenTwo.message).to.eq(errors.token);
            expect(getTokenThree.message).to.eq(errors.token);
        });

        it('should return a matching new access token', (done) => {
            let newToken;
            let decodedNew;
            let originalToken = generateAccessToken({_id: '123'}, TEST_SECRET);
            let decodedOriginal = jwt.verify(originalToken, TEST_SECRET);
            
            setTimeout(() => {
                processAccessToken(originalToken, TEST_SECRET)
                    .then((t) => {
                        newToken = t;
                        decodedNew = jwt.verify(newToken, TEST_SECRET);

                        expect(decodedOriginal.iss).to.eq(decodedNew.iss);
                        expect(decodedOriginal.sub).to.eq(decodedNew.sub);
                        expect(decodedNew.sub).to.eq('123');
                        expect(decodedNew.exp).to.be.above(decodedOriginal.exp);
                        done();
                    });
            }, 1000);

        });
    });
});