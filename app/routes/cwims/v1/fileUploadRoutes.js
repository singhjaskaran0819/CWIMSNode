'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);
//load controllers
const { fileUploadController } = require(`../../../controllers`);

let routes = [
    {
        path: '/v1/file-upload',
        method: 'POST',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required()
            // },
            formData: {
                file: Joi.any().meta({ swaggerType: 'file' }).required().description('image file'),
            },
            group: 'File',
            description: 'Route to upload file',
            model: 'FileUpload'
        },
        // auth: AVAILABLE_AUTHS.ALL,
        handler: fileUploadController.upload
    },
    // {
    //     path: '/v1/email-checker',
    //     method: 'GET',
    //     joiSchemaForSwagger: {
    //         // headers: JOI.object({
    //         //     authorization: JOI.string().required().description('jwt token')
    //         // }).unknown(),
    //         group: 'File',
    //         description: 'Route to upload file',
    //         model: 'FileUpload'
    //     },
    //     auth: false,
    //     handler: fileUploadController.emailChecker
    // }
];

module.exports = routes;




