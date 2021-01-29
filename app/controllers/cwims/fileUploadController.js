"use strict";
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES } = require('../../utils/constants');
const SERVICES = require('../../services');
const CONFIG = require('../../../config');
const { sendEmail, checkEmail } = require("../../utils/utils");

/**************************************************
 ***** File Upload controller for authentication logic ***
 **************************************************/
let fileUploadController = {};

/**
 * function to upload file to the system.
 */
fileUploadController.upload = async (payload) => {
    let data = await SERVICES.fileUploadService.uploadFileToS3(payload, CONFIG.s3Bucket.bucketName);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY), { data });
};

// /**
//  * testing for emails 
//  */
// fileUploadController.emailChecker = async (payload) => {
//     await checkEmail('jaskaran@yopmail.com');
//     return HELPERS.responseHelper.createSuccessResponse('Hello');
// }

/* export fileUploadController */
module.exports = fileUploadController;