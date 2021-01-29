const Joi = require('@hapi/joi');


const joiUtils = {};

/**
 * Extension for Joi.
 */
joiUtils.Joi = Joi.extend((Joi) => ({
    type: 'string',
    base: Joi.string(),
    messages: {
        'string.objectId': 'must be a valid id',
        'string.emailMessage': 'must be a valid email'
    },
    rules: {
        isValidEmail: {
            validate(value, helpers, args, options) {
                let filter = /^([\w]+)(.[\w]+)*@([\w]+)(.[a-z]{2,3}){1,2}$/;
                if (filter.test(value.toLowerCase())) {
                    return value.toLowerCase();
                }
                return { value, errors: helpers.error('string.emailMessage') };
            }
        }
    }
}));

module.exports = joiUtils;