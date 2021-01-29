const CONSTANTS = require('./constants'),
    BCRYPT = require("bcrypt"),
    JWT = require("jsonwebtoken"),
    CONFIG = require('../../config'),
    HANDLEBARS = require('handlebars'),
    awsSms = require('aws-sns-sms'),
    SES = require('node-ses'),
    fs = require('fs');

/**
 * nodemailer and OAuth section
 */
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.NODEMAILER_CLIENT_ID,
    process.env.NODEMAILER_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.NODEMAILER_CLIENT_REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken();
const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST || `node-mailer-host-name`,
    service: process.env.NODEMAILER_SERVICE || `node-mailer-service`,
    port: parseInt(process.env.NODEMAILER_PORT) || `node-mailer-port`,
    auth: {
        type: "OAuth2",
        user: process.env.NODEMAILER_USER,
        clientId: process.env.NODEMAILER_CLIENT_ID,
        clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
        refreshToken: process.env.NODEMAILER_CLIENT_REFRESH_TOKEN,
        accessToken: accessToken
    },
    secure: true,
    tls: { rejectUnauthorized: false },
});
// nodemailer ends

const awsConfig = {
    accessKeyId: CONFIG.AWS.AWS_ACCESS_KEY_ID,
    secretAccessKey: CONFIG.AWS.AWS_SECRET_ACESS_KEY,
    region: CONFIG.AWS.AWS_REGION
};

const emailClient = SES.createClient({
    key: CONFIG.AWS.AWS_ACCESS_KEY_ID,
    secret: CONFIG.AWS.AWS_SECRET_ACESS_KEY,
    amazon: CONFIG.AWS.AMAZON_URI
});

let commonFunctions = {};

/**
 * encrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
    return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
    return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
    const temp = Object.keys(obj).map(key => obj[key]);
    return temp;
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
    let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256', expiresIn: CONSTANTS.SECURITY.JWT_EXPIRY_TIME });
    return token;
};

commonFunctions.decryptJwt = (token) => {
    return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
    let errorMessage = '';
    if (error.message.indexOf("[") > -1) {
        errorMessage = error.message.substr(error.message.indexOf("["));
    } else {
        errorMessage = error.message;
    }
    errorMessage = errorMessage.replace(/"/g, '');
    errorMessage = errorMessage.replace('[', '');
    errorMessage = errorMessage.replace(']', '');
    error.message = errorMessage;
    return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.messageLogs = (error, success) => {
    if (error)
        console.log(`\x1b[31m` + error);
    else
        console.log(`\x1b[32m` + success);
};

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort 
 * @param {*} skip 
 * @param {*} limit 
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
    let condition = [
        ...(!!sort ? [{ $sort: sort }] : []),
        { $skip: skip },
        { $limit: limit }
    ];
    return condition;
};

/**
 * function to remove undefined keys from the payload.
 * @param {*} payload 
 */
commonFunctions.removeUndefinedKeysFromPayload = (payload = {}) => {
    for (let key in payload) {
        if (!payload[key]) {
            delete payload[key];
        }
    }
};

/**
 * Send an email to perticular user mail 
 */
commonFunctions.sendEmail = async(to, data, type) => {
    const email = commonFunctions.emailTypes(type, data);
    email.template = fs.readFileSync(email.template, 'utf-8');
    const message = await commonFunctions.renderTemplate(email.template, email.data);

    let emailToSend = {
        from: CONFIG.SMTP.SENDER,
        to,
        subject: email.subject,
        html: message
    }

    return new Promise(async(resolve, reject) => {
        try {
            let info = await transporter.sendMail(emailToSend);
            resolve(info);
        } catch (err) {
            reject(err)
        }

    })
};

commonFunctions.emailTypes = (type, payload) => {
    let EmailData = {
        subject: '',
        data: {
            logo: `${CONFIG.SERVER_URL}/public/images/cwims_logo.png`
        },
        template: ''
    };
    switch (type) {
        case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL:
            EmailData['subject'] = CONSTANTS.EMAIL_SUBJECTS.FORGOT_PASSWORD_EMAIL;
            EmailData.template = CONSTANTS.EMAIL_CONTENTS.FORGOT_PASSWORD_EMAIL;
            EmailData.data['resetPasswordLink'] = payload.resetPasswordLink;
            EmailData.data['name'] = payload.name;
            EmailData.data['forgotPasswordImage'] = `${CONFIG.SERVER_URL}/public/images/forgot-password.png`;
            break;

        case CONSTANTS.EMAIL_TYPES.OTP_EMAIL:
            EmailData['subject'] = CONSTANTS.EMAIL_SUBJECTS.OTP_EMAIL;
            EmailData.template = CONSTANTS.EMAIL_CONTENTS.OTP_EMAIL;
            EmailData.data['otp'] = payload.otp;
            EmailData.data['name'] = payload.name;
            EmailData.data['otpImage'] = `${CONFIG.SERVER_URL}/public/images/otp.png`;
            break;

        default:
            EmailData['Subject'] = 'Welcome Email!';
            break;
    }
    return EmailData;
};

commonFunctions.renderTemplate = (template, data) => {
    return HANDLEBARS.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
    let dataForJWT = { _id: userData._id, Date: Date.now, email: userData.email };
    let resetPasswordToken = commonFunctions.encryptJwt(dataForJWT);
    let resetPasswordLink = CONFIG.UI_PATHS.BASE_PATH + CONFIG.UI_PATHS.RESET_PASSWORD_PATH + resetPasswordToken;
    return { resetPasswordLink, resetPasswordToken };
};

/**
 * function to create reset password link.
 */
commonFunctions.createAccountRestoreLink = (userData) => {
    let dataForJWT = { previousAccountId: userData._id, Date: Date.now, email: userData.email, newAccountId: userData.newAccountId };
    let accountRestoreLink = CONFIG.SERVER_URL + '/v1/user/restore/' + commonFunctions.encryptJwt(dataForJWT);
    return accountRestoreLink;
};

/**
 * function to generate random alphanumeric string
 */
commonFunctions.generateAlphanumericString = (length) => {
    let chracters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var randomString = '';
    for (var i = length; i > 0; --i) randomString += chracters[Math.floor(Math.random() * chracters.length)];
    return randomString;
};

/**
 * function to generate random otp string
 * @param {otplength, } phoneNumber
 * @param {sampleSpace} String
 * @returns {randomString}
 */
commonFunctions.generateRandomString = (otplength = 6, sampleSpace = '0123456789') => {
    let randomString = '',
        range = sampleSpace.length;
    for (let index = 0; index < otplength; index++) {
        randomString += sampleSpace[Math.floor(Math.random() * (range - 1))];
    }
    return randomString;
}

/**
 * function to sent sms via AWS-SNS
 * @param {receiver} phoneNumber
 * @param {content} SMS 
 */
commonFunctions.sendSms = async(receiver, content) => {
    let msg = {
        "message": content,
        "sender": CONFIG.AWS.SMS_SENDER,
        "phoneNumber": receiver
    };
    console.log(content)
    let smsResponse = await awsSms(awsConfig, msg);
    return smsResponse
}

module.exports = commonFunctions;