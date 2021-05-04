const path = require('path');
const lodash = require('lodash');
var development = require('./env/development');
var production = require('./env/production');
var staging = require('./env/staging');
var PLATFORM = process.env.PLATFORM || 'cwims';

var defaults = {
    PLATFORM: PLATFORM,
    root: path.normalize(__dirname + '/../app'),
    theme: PLATFORM + '/us',
    adminEmail: 'admin@admin.com',
    host: 'axxondomain.com',
    SENDGRID_API_KEY: 'CHANGEME',
    environment: process.env.NODE_ENV || 'production',
    show: function () {
        console.log('environment: ' + this.environment);
    },
    SENDINBLUE: {
        API_KEY: 'dummy',
        SENDER_EMAIL: 'contact@demo.in'
    },
    SMTP: {
        SENDER: process.env.NODEMAILER_SENDER || 'nodemailer-sender',
    },
    FCM: {
        API_KEY: 'FCM_API_KEY'
    },
    GOOGLE_API_KEY: 'AIzaSyAF-XUzgKM3yFEP9rTzCdDzBBVPtotIHVU' || 'google-api-key',
    AWS: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || `aws_access_key`,
        AWS_SECRET_ACESS_KEY: process.env.AWS_SECRET_ACESS_KEY || 'aws_secret_key',
        AWS_REGION: process.env.AWS_REGION || 'ohio',
        SMS_SENDER: process.env.SMS_SENDER || 'Axxon',
        EMAIL_SENDER: process.env.EMAIL_SENDER || 'noreply@axxon.com',
        AMAZON_URI: process.env.AMAZON_URI || 'amazon-uri'
    },
    ENV_STAGING: "staging",
    ENV_DEVELOPMENT: "development",
    ENV_PRODUCTION: "production",
    environment: process.env.NODE_ENV || 'development',
    SQL: {
        DB_NAME: process.env.DB_NAME || 'db_name',
        USERNAME: process.env.DB_USERNAME || 'db_username',
        PASSWORD: process.env.DB_PASSWORD || 'db_password',
        HOST: process.env.DB_HOST || 'db_host'
    },
    domain: {
        PROTOCOL: process.env.DOMAIN_PROTOCOL || 'http',
        HOST: process.env.DOMAIN_HOST || '127.0.0.1',
        PORT: process.env.DOMAIN_PORT ? process.env.DOMAIN_PORT : '3000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}${!!this.PORT ? ':' + this.PORT : ''}` }
    },
    server: {
        PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
        HOST: process.env.SERVER_HOST || '0.0.0.0',
        PORT: process.env.SERVER_PORT || '3000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}:${this.PORT}` }
    },
    STRIPE: {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'stripe-secret-key'
    },
    PATH_FOR_LOCAL: process.env.PATH_FOR_LOCAL || '/uploads/',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    swagger: require('./swagger'),
    s3Bucket: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'access-key-id',
        secretAccessKey: process.env.AWS_SECRET_ACESS_KEY || 'secret-access-key',
        bucketName: process.env.BUCKET_NAME || 'bucket-name'
    },
    UI_PATHS: {
        BASE_PATH: process.env.CLIENT_APP_BASE_URL || 'http://localhost:4200',
        RESET_PASSWORD_PATH: process.env.CLIENT_APP_RESET_PASSWORD_PATH || '/reset-password/',
        USER_LIST: process.env.USER_LIST || 'user-list',
        REGENERATE_OTP: process.env.REGENERATE_OTP || 'pending-approval'
    },
    REDIS: {
        PORT: process.env.REDIS_PORT || '6379',
        HOST: process.env.REDIS_HOST || '127.0.0.1'
    },
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL || '/uploads/files',
};

let currentEnvironment = process.env.NODE_ENV || 'production';

function myConfig(myConfig) {
    let mergedConfig = lodash.extend(lodash.clone(defaults), myConfig);
    return mergedConfig;
};

module.exports = {
    development: myConfig(development),
    production: myConfig(production),
    staging: myConfig(staging)
}[currentEnvironment];


