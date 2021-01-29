'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);

// load controllers
const userController = require(`../../../controllers/cwims/userController`);

let routes = [
    {
        method: 'POST',
        path: '/v1/user/validate-captcha',
        joiSchemaForSwagger: {
            body: {
                recaptcha: Joi.string().required()
            },
            group: 'User',
            description: 'Route to validate captcha.',
            model: 'Validate_captcha'
        },
        handler: userController.validateCaptcha
    },
    {
        method: 'POST',
        path: '/v1/user/login',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string(),
                password: Joi.string().required()
            },
            group: 'User',
            description: 'Route to login a user of any role.',
            model: 'User_Login'
        },
        auth: false,
        handler: userController.login
    },
    {
        method: 'GET',
        path: '/v1/user/get-roles-for-signup',
        joiSchemaForSwagger: {
            group: 'User',
            description: 'Route to get role in signup process.',
            model: 'Get_roles_for_signup'
        },
        handler: userController.getRolesForSignup
    },
    {
        method: 'POST',
        path: '/v1/user/sign-up',
        joiSchemaForSwagger: {
            body: {
                role: Joi.number(),
                firstName: Joi.string(),
                lastName: Joi.string(),
                email: Joi.string(),
                phoneNumber: Joi.string(),
                addressLine1: Joi.string(),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                profilePicture: Joi.string(),
                password: Joi.string()
            },
            group: 'User',
            description: 'Route to signup for operator and officer.',
            model: 'Sign_up'
        },
        auth: false,
        handler: userController.register
    },
    {
        method: 'POST',
        path: '/v1/user/forgot-password',
        joiSchemaForSwagger: {
            body: {
                email: Joi.string().required()
            },
            group: 'User',
            description: 'Route to send reset password link.',
            model: 'Forgot_Password'
        },
        auth: false,
        handler: userController.forgotPassword
    },
    {
        method: 'POST',
        path: '/v1/user/verify-otp',
        joiSchemaForSwagger: {
            body: {
                otp: Joi.string().description('OTP'),
                role: Joi.number().required(),
                email: Joi.string().required()
            },
            group: 'User',
            description: 'Route to verify user using OTP.',
            model: 'Verify_user'
        },
        auth: false,
        handler: userController.verifyOtp
    },
    {
        method: 'POST',
        path: '/v1/user/resend-otp',
        joiSchemaForSwagger: {
            body: {
                role: Joi.number().required(),
                email: Joi.string().required()
            },
            group: 'User',
            description: 'Route to resend OTP.',
            model: 'Resend_OTP'
        },
        auth: false,
        handler: userController.resendOTP
    },
    {
        method: 'GET',
        path: '/v1/user/logout',
        joiSchemaForSwagger: {
            headers: {
                'authorization': Joi.string().required()
            },
            group: 'User',
            description: 'Route to logout.',
            model: 'logout'
        },
        auth: true,
        handler: userController.logout
    },
    {
        method: 'GET',
        path: '/v1/user/get-details',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            query: {
                userId: Joi.string()
            },
            group: 'User',
            description: 'Route to fetch user details.',
            model: 'Fetch_User'
        },
        auth: true,
        handler: userController.fetchUser
    },
    {
        method: 'PUT',
        path: '/v1/user/reset-password',
        joiSchemaForSwagger: {
            body: {
                token: Joi.string().required().description('User reset password token'),
                password: Joi.string().required().description('User new password')
            },
            group: 'User',
            description: 'Route to reset password.',
            model: 'Reset_Password'
        },
        auth: false,
        handler: userController.resetPassword
    },
    {
        method: 'PUT',
        path: '/v1/user/change-password',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            body: {
                password: Joi.string().required().description('User current password'),
                newPassword: Joi.string().required().description('User new password')
            },
            group: 'User',
            description: 'Route to change password.',
            model: 'Change_Password'
        },
        auth: true,
        handler: userController.changePassword
    },
    {
        method: 'PUT',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            query: {
                userId: Joi.string(),
                id: Joi.string()
            },
            body: {
                role: Joi.number(),
                firstName: Joi.string(),
                lastName: Joi.string(),
                phoneNumber: Joi.string(),
                addressLine1: Joi.string(),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                profilePicture: Joi.string(),
                status: Joi.number()
            },
            group: 'User',
            description: 'Route to update user profile.',
            model: 'Update_User'
        },
        auth: true,
        handler: userController.updateUser
    },

    // user management
    {
        method: 'POST',
        path: '/v1/user/add-user',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            body: {
                role: Joi.number(),
                firstName: Joi.string(),
                lastName: Joi.string(),
                email: Joi.string(),
                phoneNumber: Joi.string(),
                addressLine1: Joi.string(),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                profilePicture: Joi.string(),
                password: Joi.string()
            },
            group: 'User Management',
            description: 'Route to add new user.',
            model: 'Add_User'
        },
        auth: true,
        handler: userController.addUser
    },
    {
        method: 'PUT',
        path: '/v1/user/suspend-user',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            body: {
                userId: Joi.string(),
                isSuspended: Joi.boolean(),
            },
            group: 'User Management',
            description: 'Route to suspend user.',
            model: 'Suspend_User'
        },
        // auth: true,
        handler: userController.suspendUser
    },
    {
        method: 'GET',
        path: '/v1/user/list-user',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            query: {
                city: Joi.string(),
                country: Joi.string(),
                role: Joi.number(),
                limit: Joi.number().default(10),
                skip: Joi.number().default(0)
            },
            group: 'User Management',
            description: 'Route to list all users.',
            model: 'List_Users'
        },
        auth: true,
        handler: userController.listUser
    },
    {
        method: 'PUT',
        path: '/v1/user/approveOrRejectUser',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            body: {
                email: Joi.string().required(),
                status: Joi.number().required().description('1 => Approve || 2 => Reject'),
                rejectionReason: Joi.string()
            },
            group: 'User Management',
            description: 'Route to approve/reject user.',
            model: 'Approve_Or_Reject_User'
        },
        auth: true,
        handler: userController.approveOrRejectUser
    },
    {
        method: 'GET',
        path: '/v1/user/get-filters',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            group: 'User Management',
            description: 'Route to get filters in user management.',
            model: 'Get_Filters_Users'
        },
        auth: true,
        handler: userController.getFilters
    },
    {
        method: 'DELETE',
        path: '/v1/user',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            query: {
                id: Joi.string().required()
            },
            group: 'User Management',
            description: 'Route to delete user permanently.',
            model: 'Delete_user'
        },
        auth: true,
        handler: userController.deleteUser
    },
    {
        method: 'GET',
        path: '/v1/user/get-permissions',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required().description('User auth token')
            },
            group: 'User Management',
            description: 'Route to get permissions under given role.',
            model: 'Get_Permissions'
        },
        auth: true,
        handler: userController.getPermissions
    }
];

module.exports = routes;
