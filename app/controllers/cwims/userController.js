"use strict";

const CONFIG = require('../../../config');
const HELPERS = require("../../helpers");
const CONSTANTS = require('../../utils/constants');
const SERVICES = require('../../services');
const utils = require(`../../utils/utils`);
const moment = require('moment');
const { Op } = require('sequelize');
const _ = require('lodash');
const axios = require('axios');
const { EMAIL_TYPES, DEFAULTS, ERROR_TYPES } = require('../../utils/constants');

/**************************************************
 ***** User/Auth controller for authentication logic ***
 **************************************************/
let userController = {};

/**
 * get user roles for signup
 */
userController.getRolesForSignup = async (payload) => {
    let data = await SERVICES.roleService.fetchRoles({
        id: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN },
        nature: CONSTANTS.ROLE_NATURE.SYSTEM
    }, ['id', 'title']);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_LIST_FETCHED), { data })
}

/**
 * update user controller 
 */
userController.updateUser = async (payload) => {
    if (payload.id || payload.userId) {
        await SERVICES.userService.updateUser({ ...(payload.id ? { id: payload.id } : { id: payload.userId }) }, payload);
    } else {
        await SERVICES.userService.updateUser({ id: payload.user.id }, payload);
    }
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PROFILE_UPDATE_SUCCESSFULLY)
}

/**
 * login controller 
 */
userController.login = async (payload) => {
    let criteria = {
        email: payload.email
    }

    let user = await SERVICES.userService.getUser(criteria, {}, true, ['id', 'title']);

    // if user doesn't exist 
    if (!user) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }

    if (user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        // if user is verified
        if (!user.isAccountVerified) {
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_NOT_VERIFIED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        // if user is verified
        if (user.isSuspended) {
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        if (user.status != CONSTANTS.USER_STATUS.Approved) {
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.REQUEST_UNDER_PROCESSING, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        // if user is blocked
        if (user.isBlocked) {
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_BLOCKED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }
    }

    if (utils.compareHash(payload.password, user.password)) {
        let accessToken = utils.encryptJwt({
            role: user.role,
            userId: user.id,
            timestamp: new Date()
        })
        let session = {
            role: user.role,
            accessToken,
            userId: user.id
        }
        user.unsuccessfulLogins = 0;
        await user.save();
        await SERVICES.sessionService.createSession(session);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: { accessToken, role: user.role, roleTitle: user.userrole.title, nature: user.userrole.nature } });
    } else {
        if ((user.unsuccessfulLogins + 1) > 4) {
            user.isBlocked = true;
            user.save();
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.UNSUCCESSFUL_LOGIN_ATTEMPTS_EXCEEDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        }
        user.unsuccessfulLogins = user.unsuccessfulLogins + 1;
        await user.save();
        let error_msg = CONSTANTS.MESSAGES.INVALID_PASSWORD.replace('@attempts', (5 - user.unsuccessfulLogins));
        throw HELPERS.responseHelper.createErrorResponse(error_msg, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
}

/**
 * register controller
 */
userController.register = async (payload) => {
    let checkUserEmail = await SERVICES.userService.getUser({ email: payload.email }, {});
    let checkUserPhoneNumber = await SERVICES.userService.getUser({ phoneNumber: payload.phoneNumber }, {});
    if (checkUserEmail) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    if (checkUserPhoneNumber) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    let user = await SERVICES.userService.createUser(payload);

    // Sending OTP to the registered user
    await generateOTPAndSendToUser(user);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OTP_SENT_SUCCESSFULLY);
}

/**
 * add new user
 */
userController.addUser = async (payload) => {
    payload.businessRoleUser = true;
    let checkUserEmail = await SERVICES.userService.getUser({ email: payload.email }, {});
    let checkUserPhoneNumber = await SERVICES.userService.getUser({ phoneNumber: payload.phoneNumber }, {});
    if (checkUserEmail) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    if (checkUserPhoneNumber) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    Object.assign(payload, {
        isAccountVerified: true,
        status: CONSTANTS.USER_STATUS.Approved
    })
    let user = await SERVICES.userService.createUser(payload);
    // TODO: shoot mail here
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_ADDED);
}

/**
 * captcha validate controller 
 */
userController.validateCaptcha = async (payload) => {
    let token = payload.recaptcha;
    const secretkey = CONSTANTS.SECURITY.CAPTCHA_SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}`;
    if (token === null || token === undefined) {
        return HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_CAPTCHA_TOKEN, ERROR_TYPES.BAD_REQUEST);
    }

    let data = await axios.get(url);
    if (data.success !== undefined && !data.success) {
        return HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CAPTCHA_FAILED, ERROR_TYPES.BAD_REQUEST);
    }

    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.CAPTCHA_VERIFIED);
}

/**
 * list all users
 */
userController.listUser = async (payload) => {
    let criteria;
    let pagination = {
        limit: payload.limit,
        offset: payload.skip
    };
    let filters = {
        ...(payload.city && { city: payload.city }),
        ...(payload.country && { country: payload.country }),
        ...(payload.role && { role: payload.role })
    }
    let attributes = {
        exclude: ['password', 'otp']
    }
    if (payload.user.role === CONSTANTS.USER_ROLES.ADMIN) {
        criteria = {
            role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN }
        }
    } else if (payload.user.role === CONSTANTS.USER_ROLES['CUSTOMS MANAGER']) {
        criteria = {
            [Op.and]: [
                {
                    role: {
                        [Op.ne]: CONSTANTS.USER_ROLES.ADMIN
                    }
                },
                {
                    role: {
                        [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER']
                    }
                }
            ]
        }
    } else if (payload.user.role === CONSTANTS.USER_ROLES['WAREHOUSE MANAGER']) {
        criteria = {
            role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'],
            role: { [Op.gte]: 7 }
        };
    } else if (payload.user.role === CONSTANTS.USER_ROLES['WAREHOUSE CLERK']) {
        criteria = { role: { [Op.gte]: 7 } };
    } else if (payload.user.role === CONSTANTS.USER_ROLES['CUSTOMS CLERK']) {
        criteria = {
            [op.and]: [
                { role: { [Op.gte]: 7 } },
                { role: { [Op.in]: [CONSTANTS.USER_ROLES['API CONSUMER'], CONSTANTS.USER_ROLES['WAREHOUSE MANAGER'], CONSTANTS.USER_ROLES['WAREHOUSE CLERK']] } },
            ]
        };
    } else {
        criteria = { role: { [Op.gte]: 7 } };
    }

    criteria = {
        ...criteria,
        ...filters
    }

    let data = await SERVICES.userService.listUser(criteria, attributes, pagination);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_LIST_FETCHED), { data: { list: data.rows, totalCount: data.count } })
}

/**
 * logout controller
 */
userController.logout = async (payload) => {
    await SERVICES.sessionService.removeSession({ accessToken: payload.user.accessToken });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOGGED_OUT_SUCCESSFULLY);
}

/**
 * approving and rejecting user
 */
userController.approveOrRejectUser = async (payload) => {
    await SERVICES.userService.updateUser({ email: payload.email }, { status: payload.status, rejectionReason: payload.rejectionReason });
    // TODO: mail for specific operation
    let succ_msg;
    if (payload.status == CONSTANTS.USER_STATUS.Approved) {
        succ_msg = CONSTANTS.MESSAGES.USER_APPROVED;
    } else if (payload.status == CONSTANTS.USER_STATUS.Rejected) {
        succ_msg = CONSTANTS.MESSAGES.USER_REJECTED;
    }
    return HELPERS.responseHelper.createSuccessResponse(succ_msg);
}

/**
 * fetch by email controller
 */
userController.fetchUser = async (payload) => {
    let data;
    if (payload.userId) {
        data = await SERVICES.userService.getUser({ id: payload.userId }, { exclude: ['password', 'otp'] });
    } else {
        data = await SERVICES.userService.getUser({ id: payload.user.id }, { exclude: ['warehouseCode', 'password', 'otp'] }, false, { exclude: ['permissions', 'createdAt', 'updatedAt', 'type'] });
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_PROFILE_FETCHED_SUCCESSFULLY), { data });
}

/**
 * forgot password controller
 */
userController.forgotPassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ email: payload.email }, { excludes: ['password'] });
    if (user.isSuspended) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    if (user) {
        if (user.resetPasswordToken) {
            try {
                let resetTokenData = utils.decryptJwt(user.resetPasswordToken);
                let messageTime = moment(new Date()).diff(new Date(resetTokenData.timestamp), 'minutes');
                if (messageTime <= DEFAULTS.FORGOT_PASSWORD_EMAIL_TIMING) {
                    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CONFIRMATION_LINK_ALREADY_SENT.replace('@time', moment.utc(moment.duration(((120 - messageTime) * 60), "seconds").asMilliseconds()).format("HH:mm")), CONSTANTS.ERROR_TYPES.BAD_REQUEST);
                }
            } catch (err) {

            }
        }
        let resetPasswordToken = utils.encryptJwt({
            role: user.role,
            userId: user.id,
            timestamp: new Date()
        })
        user.resetPasswordToken = resetPasswordToken;
        await user.save();
        let resetPasswordLink = `${CONFIG.UI_PATHS.BASE_PATH}${CONFIG.UI_PATHS.RESET_PASSWORD_PATH}/${resetPasswordToken}`;
        try {
            await utils.sendEmail(user.email, { resetPasswordLink, name: user.firstName }, EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
        } catch (err) {
            console.log("forgot password email: ", err)
        }
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.EMAIL_SENT_TO_REGISTERED_EMAIL_WITH_RESET_PASSWORD_LINK);
    }
    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.NO_USER_FOUND_WITH_THIS_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
}

/**
 * reset password controller
 */
userController.resetPassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ resetPasswordToken: payload.token }, null);
    await SERVICES.userService.updateUser({ id: user.id }, { password: payload.password, lastPasswordUpdated: new Date(), isBlocked: false, resetPasswordToken: null });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESSFULLY);
}

/**
 * suspend user
 */
userController.suspendUser = async (payload) => {
    await SERVICES.userService.updateUser({ id: payload.user.userId }, { isSuspended: payload.isSuspended });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_SUSEPENDED);
}

/**
 * change password controller
 */
userController.changePassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ id: payload.user.id }, { attributes: ['password'] });
    if (utils.compareHash(payload.password, user.password)) {
        await SERVICES.userService.updateUser({ id: user.id }, { password: payload.newPassword, lastPasswordUpdated: new Date() });
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESSFULLY);
    }
    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CURRENT_PASSWORD_NOT_MATCHED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
}

/**
 * verify OTP controller
 */
userController.verifyOtp = async (payload) => {
    let data = await SERVICES.userService.verifyOtp({ email: payload.email, role: payload.role }, payload.otp);
    // if (!data.status) {
    //     if (data.code === CONSTANTS.OTP_STATUSES.INVALID_OTP) {
    //         throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_OTP, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    //     } else if (data.code === CONSTANTS.OTP_STATUSES.OTP_EXPIRED) {
    //         throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.OTP_EXPIRED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    //     }
    // }

    // TODO: need to remove after uncommenting above code 
    if (!data) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_OTP, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    // TODO
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY);
}

/**
 * resend OTP
 */
userController.resendOTP = async (payload) => {
    let user = await SERVICES.userService.getUser({ email: payload.email, role: payload.role }, { excludes: ['password'] });
    // Sending OTP to the registered user
    await generateOTPAndSendToUser(user)
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OTP_RESENT);
}

async function generateOTPAndSendToUser(user) {
    let otp = utils.generateRandomString();
    console.log(`OTP for user ${user.firstName}: `, otp)
    let tokenExpiresAt = new Date();
    tokenExpiresAt = new Date().setMinutes(new Date().getMinutes() + 10);
    user.otp = utils.encryptJwt({ otp, tokenExpiresAt });
    try {
        await utils.sendEmail(user.email, { otp, name: user.firstName }, EMAIL_TYPES.OTP_EMAIL);
    } catch (err) {
        console.log("Send email error: ", err)
    }
    return await user.save();
}

/**
 * get filters
 */
userController.getFilters = async (payload) => {
    let data = await SERVICES.userService.getFilters({
        ...(payload.user.role == CONSTANTS.USER_ROLES.ADMIN ? { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] ? {
            [Op.and]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['CUSTOMS CLERK'] ? {
            [Op.and]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS CLERK'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['API CONSUMER'] ? {
            [Op.and]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS CLERK'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['API CONSUMER'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['WAREHOUSE MANAGER'] ? {
            [Op.and]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'] },
                { role: { [Op.gte]: 7 } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['WAREHOUSE CLERK'] ? {
            role: { [Op.gte]: 7 }
        } : {}),
        ...(payload.user.role >= 7 ? {
            role: { [Op.gte]: 7 }
        } : {})
    });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.FILTERS_FETCHED), { data });
}

/**
 * for deleting user permanently
 */
userController.deleteUser = async (payload) => {
    await SERVICES.userService.deleteUser({ id: payload.id });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_DELETED);
}

/**
 * get permissions
 */
userController.getPermissions = async (payload) => {
    let data = await SERVICES.roleService.fetchRole({ id: payload.user.role }, ['permissions']);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PERMISSIONS_FETCHED), { data });
}

module.exports = userController;


// {
//     "dashboard": [
//         "view"
//     ],
//     "declaration": [],
//     "inventory": {
//         "list": [
//             "listing"
//         ]
//     },
//     "warehouse": [
//         "listing"
//     ],
//     "sale": {
//         "create-new-sale": [],
//         "list-sale": []
//     },
//     "standard-report": [],
//     "user-management": {
//         "list-of-user": [
//             "create-new-user",
//             "suspend-user",
//             "accept-reject-user",
//             "delete-user",
//             "reassign-role"
//         ],
//         "manage-roles": [
//             "create-new-role",
//             "update-role",
//             "delete-role"
//         ]
//     },
//     "appointment": [
//         "listing",
//         "approve-reject-item"
//     ]
// }