const expect = require('chai').expect;
const request = require('request');
let chai = require('chai');
// let chaiHttp = require('chai-http');
// chai.use(chaiHttp);

const CONFIG = require('../config');
const BASE_URL = CONFIG.server.URL;
const MODELS = require('../app/models')
const { decryptJwt } = require('../app/utils/utils')
const { HTTP_REQUEST_STATUS_CODES } = require('../app/utils/constants')
const DUMMY_USER = {
    PHONE: '+919876543210',
    EMAIL: 'test@axxon.com',
    INCORRECT_OTP: 1234,
    CORRECT_OTP: null,
    TOKEN: ''
}
/**
 * Test cases for all end points.
 */
describe('#API Integration:', () => {

    const database = null;

    before(function () {
        // initialize mongodb 
        require('../app/startup/db_mongo')();
    });

    // check base path GET request only. (Server is working or not)
    it('Base Path request', function (done) {
        request(`${BASE_URL}/v1/serverResponse`, function (error, response) {
            expect(response.statusCode).to.equal(HTTP_REQUEST_STATUS_CODES.SUCCESS);
            done();
        });
    });

    //Guest User Register
    it('Guest User Register request', function (done) {
        request.post({
            url: `${BASE_URL}/v1/user/register`,
            body: {
                phone: DUMMY_USER.PHONE,
                email: DUMMY_USER.EMAIL
            },
            json: true
        }, (error, response) => {
            responseBody = response.body;
            // response body should have property succes.
            expect(responseBody).to.have.property('success');
            expect(response.statusCode).to.equal(HTTP_REQUEST_STATUS_CODES.SUCCESS);
            done();
        })
    });

    //Verify Correct OTP for Guest User
    it('Verify CORRECT OTP', function (done) {
        MODELS.userModel.findOne({ phone: DUMMY_USER.PHONE }).lean()
            .then(user => {
                let otpData = decryptJwt(user.otp)
                DUMMY_USER.CORRECT_OTP = otpData.otp;
            })
            .then(() => {
                request.post({
                    url: `${BASE_URL}/v1/user/verify-otp`,
                    body: {
                        phone: DUMMY_USER.PHONE,
                        otp: DUMMY_USER.CORRECT_OTP
                    },
                    json: true
                }, (error, response) => {
                    responseBody = response.body;
                    // response body should have property token.
                    expect(responseBody)
                        .to.have.property('token');
                    DUMMY_USER.TOKEN = responseBody.token;
                    expect(response.statusCode)
                        .to.equal(HTTP_REQUEST_STATUS_CODES.SUCCESS);
                    done();
                })
            });
    });

    //Verify Incorrect OTP for Guest User
    it('Verify INCORRECT OTP', function (done) {
        request.post({
            url: `${BASE_URL}/v1/user/verify-otp`,
            body: {
                phone: DUMMY_USER.PHONE,
                otp: DUMMY_USER.INCORRECT_OTP
            },
            json: true
        }, (error, response) => {
            responseBody = response.body;
            expect(response.statusCode)
                .to.equal(HTTP_REQUEST_STATUS_CODES.UN_AUTHORIZED);
            done();
        })
    });
});