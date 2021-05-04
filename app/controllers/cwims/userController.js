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

/*********************************************************
 ***** User/Auth controller for authentication logic *****
 *********************************************************/
let userController = {};

/**
 * generate OTP and send to user
 */
async function generateOTPAndSendToUser(user) {
    let otp = utils.generateRandomString();
    console.log(`OTP for user ${user.firstName}: `, otp)
    let tokenExpiresAt = new Date();
    tokenExpiresAt = new Date().setMinutes(new Date().getMinutes() + 3);
    user.otp = utils.encryptJwt({ otp, tokenExpiresAt });
    try {
        let pendingApprovalLink = `${CONFIG.UI_PATHS.BASE_PATH}${CONFIG.UI_PATHS.REGENERATE_OTP}`;
        await utils.sendEmail(user.email, { otp, pendingApprovalLink, name: user.firstName, }, CONSTANTS.EMAIL_TYPES.OTP_EMAIL);
    } catch (err) {
        console.log("Send email error: ", err)
    }
    return await user.save();
}

/**
 * get user roles for signup
 */
userController.getRolesForSignup = async (payload) => {
    let data = await SERVICES.roleService.fetchRoles({
        id: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN },
        nature: CONSTANTS.ROLE_NATURE.SYSTEM
    }, ['id', 'title']);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_LIST_FETCHED), { data: data.rows })
}

/**
 * update user controller 
 */
userController.updateUser = async (payload) => {
    if (payload.userId) {
        await SERVICES.userService.updateUser({ id: payload.userId }, payload);
        if (payload.role) {
            let user = await SERVICES.userService.getUser({ id: payload.userId });
            let roleData = await SERVICES.roleService.fetchRole({ id: payload.role });
            // add logs into the system
            let logData = {
                operation: CONSTANTS.LOGS_OPERATION.ROLE_REASSIGNED,
                doneBy: payload.user.id,
                doneTo: payload.userId
            };
            await SERVICES.logsService.create(logData);
            // force logout for that user
            await SERVICES.sessionService.removeSession({ userId: payload.userId });
            await utils.sendEmail(user.email, { name: user.firstName, role: roleData.title, assignedBy: payload.user.userrole.title }, CONSTANTS.EMAIL_TYPES.NEW_ROLE_ASSIGNED);
        }
        if (payload.isSuspended) {
            // add logs into the system
            let logData = {
                operation: CONSTANTS.LOGS_OPERATION.SUSPEND_USER,
                doneBy: payload.user.id,
                doneTo: payload.userId
            };
            await SERVICES.logsService.create(logData);
        } else if (payload.isSuspended === false) {
            // add logs into the system
            let logData = {
                operation: CONSTANTS.LOGS_OPERATION.UNSUSPEND_USER,
                doneBy: payload.user.id,
                doneTo: payload.userId
            };
            await SERVICES.logsService.create(logData);
        }
    } else {
        if (payload.email) {
            // check if user already exists with that email
            let checkUser = await SERVICES.userService.getUser({ email: payload.email, id: { [Op.ne]: payload.user.id } });
            if (checkUser) {
                await SERVICES.logsService.create({
                    operation: CONSTANTS.LOGS_OPERATION.PROFILE_UPDATED,
                    error: CONSTANTS.MESSAGES.EMAIL_ALREADY_ASSOCIATED,
                    isError: true,
                    module: 'USER',
                    doneBy: payload.user.id
                })
                throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.EMAIL_ALREADY_ASSOCIATED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
            }
        }
        await SERVICES.userService.updateUser({ id: payload.user.id }, payload);
        // add logs for this operation
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.PROFILE_UPDATED,
            doneBy: payload.user.id
        });
    }
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PROFILE_UPDATE_SUCCESSFULLY)
}

/**
 * login controller 
 */
userController.login = async (payload) => {
    let criteria = {
        email: payload.email,
        isDeleted: false
    }

    let user = await SERVICES.userService.getUser(criteria, {}, true, ['id', 'title']);

    // if user doesn't exist 
    if (!user) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }

    // check if user has created his own password or not
    if (!user.userCreatedOwnPassword) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
            error: CONSTANTS.MESSAGES.PASSWORD_NOT_GENERATED,
            isError: true,
            module: 'USER',
            doneBy: user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.PASSWORD_NOT_GENERATED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }

    if (user.role !== CONSTANTS.USER_ROLES.ADMIN) {
        // if user is verified
        if (!user.isAccountVerified) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
                error: CONSTANTS.MESSAGES.USER_NOT_VERIFIED,
                isError: true,
                module: 'USER',
                doneBy: user.id
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_NOT_VERIFIED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        // if user is verified
        if (user.isSuspended) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
                error: CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED,
                isError: true,
                module: 'USER',
                doneBy: user.id
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        if (user.status != CONSTANTS.USER_STATUS.Approved) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
                error: CONSTANTS.MESSAGES.REQUEST_UNDER_PROCESSING,
                isError: true,
                module: 'USER',
                doneBy: user.id
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.REQUEST_UNDER_PROCESSING, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
        }

        // if user is blocked
        if (user.isBlocked) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
                error: CONSTANTS.MESSAGES.ACCOUNT_BLOCKED,
                isError: true,
                module: 'USER',
                doneBy: user.id
            })
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
        // add logs into the system
        let logData = {
            operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
            doneBy: user.id
        };
        await SERVICES.logsService.create(logData);
        user.unsuccessfulLogins = 0;
        await user.save();
        await SERVICES.sessionService.createSession(session);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOG_IN_SUCCESSFULLY), { data: { accessToken, role: user.role, roleTitle: user.userrole.title, nature: user.userrole.nature } });
    } else {
        // add logs for this action
        await SERVICES.logsService.create({
            doneBy: user.id,
            operation: CONSTANTS.LOGS_OPERATION.LOGIN_ATTEMPT_FAILED
        });
        if ((user.unsuccessfulLogins + 1) > 4) {
            user.isBlocked = true;
            user.save();
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
                error: CONSTANTS.MESSAGES.UNSUCCESSFUL_LOGIN_ATTEMPTS_EXCEEDED,
                isError: true,
                module: 'USER',
                doneBy: user.id
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.UNSUCCESSFUL_LOGIN_ATTEMPTS_EXCEEDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        }
        user.unsuccessfulLogins = user.unsuccessfulLogins + 1;
        await user.save();
        let error_msg = CONSTANTS.MESSAGES.INVALID_PASSWORD.replace('@attempts', (5 - user.unsuccessfulLogins));
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.LOG_IN,
            error: error_msg,
            isError: true,
            module: 'USER',
            doneBy: user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(error_msg, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
}

/**
 * register controller
 */
userController.register = async (payload) => {
    let checkUser = await SERVICES.userService.getUser({
        [Op.or]: [
            { email: payload.email },
            { phoneNumber: payload.phoneNumber }
        ]
    }, {});

    // to check if the user is deleted or not
    if (checkUser && checkUser.isDeleted) {
        await SERVICES.userService.destroyUserData({ email: payload.email });
        checkUser = null;
    }

    // moreInfo is a flag where user is re-entering his information for getting its account approved by admin
    if (!payload.moreInfo) {
        if (checkUser && (checkUser.email === payload.email)) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.REGISTER_USER,
                error: CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL,
                isError: true,
                module: 'USER'
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        }
        if (checkUser && (checkUser.phoneNumber === payload.phoneNumber)) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.REGISTER_USER,
                error: CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE,
                isError: true,
                module: 'USER'
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        }
    }
    let user;
    if (payload.moreInfo) {
        payload = { ...payload, ...{ status: CONSTANTS.USER_STATUS.Pending } }
        await SERVICES.userService.updateUser({ id: payload.id }, payload);
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.APPLICATION_RESUBMITTED);
    } else {
        user = await SERVICES.userService.createUser({ ...payload, ...{ userCreatedOwnPassword: true } });
        // Sending OTP to the registered user
        await generateOTPAndSendToUser(user);
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OTP_SENT_SUCCESSFULLY);
    }
}

/**
 * add new user
 */
userController.addUser = async (payload) => {
    let checkUser = await SERVICES.userService.getUser({
        [Op.or]: [
            { email: payload.email },
            { phoneNumber: payload.phoneNumber }
        ]
    }, {});
    // to check if the user is deleted or not
    if (checkUser && checkUser.isDeleted) {
        await SERVICES.userService.destroyUserData({ email: payload.email });
        checkUser = null;
    }
    if (checkUser && (checkUser.email === payload.email)) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.ADD_USER,
            error: CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL,
            isError: true,
            module: 'USER'
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    if (checkUser && checkUser.phoneNumber === payload.phoneNumber) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.ADD_USER,
            error: CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE,
            isError: true,
            module: 'USER'
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USER_ALREADY_EXIST_PHONE, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    Object.assign(payload, {
        isAccountVerified: true,
        status: CONSTANTS.USER_STATUS.Approved
    })
    let user = await SERVICES.userService.createUser(payload);

    let resetPasswordToken = utils.encryptJwt({
        role: user.role,
        userId: user.id,
        timestamp: new Date()
    })
    user.resetPasswordToken = resetPasswordToken;
    await user.save();
    // add logs into the system
    let logData = {
        operation: CONSTANTS.LOGS_OPERATION.ADD_USER,
        doneBy: payload.user.id,
        doneTo: user.id
    };
    await SERVICES.logsService.create(logData);
    let data = {
        name: user.firstName,
        email: user.email,
        password: payload.password,
        navigationLink: CONFIG.UI_PATHS.BASE_PATH,
        resetPasswordLink: `${CONFIG.UI_PATHS.BASE_PATH}${CONFIG.UI_PATHS.RESET_PASSWORD_PATH}/${resetPasswordToken}`
    }
    await utils.sendEmail(user.email, data, CONSTANTS.EMAIL_TYPES.ACCOUNT_ADDED);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ADD_USER);
}

/**
 * captcha validate controller 
 */
userController.validateCaptcha = async (payload) => {
    let token = payload.recaptcha;
    const secretkey = CONSTANTS.SECURITY.CAPTCHA_SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}`;
    if (token === null || token === undefined) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_CAPTCHA_TOKEN, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }

    let data = await axios.get(url);
    if (data.success !== undefined && !data.success) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CAPTCHA_FAILED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
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
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection)
    let filters = {
        ...(payload.city && { city: payload.city }),
        ...(payload.country && { country: payload.country }),
        ...(payload.role && { role: payload.role }),
        ...(payload.status && { status: payload.status })
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
            [Op.or]: [
                { role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'] },
                { role: { [Op.gte]: 7 } }
            ]
        };
    } else if (payload.user.role === CONSTANTS.USER_ROLES['WAREHOUSE CLERK']) {
        criteria = { role: { [Op.gte]: 7 } };
    } else if (payload.user.role === CONSTANTS.USER_ROLES['CUSTOMS CLERK']) {
        criteria = {
            [op.or]: [
                { role: { [Op.gte]: 7 } },
                { role: { [Op.in]: [CONSTANTS.USER_ROLES['API CONSUMER'], CONSTANTS.USER_ROLES['WAREHOUSE MANAGER'], CONSTANTS.USER_ROLES['WAREHOUSE CLERK']] } },
            ]
        };
    } else {
        criteria = { role: { [Op.gte]: 7 } };
    }

    criteria = {
        ...criteria,
        ...filters,
        isDeleted: false
    }

    let data = await SERVICES.userService.listUser(criteria, attributes, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_LIST_FETCHED), { data: { list: data.rows, totalCount: data.count } })
}

/**
 * logout controller
 */
userController.logout = async (payload) => {
    await SERVICES.sessionService.removeSession({ accessToken: payload.user.accessToken });
    // add logs into the system
    let logData = {
        operation: payload.idleSystem ? CONSTANTS.LOGS_OPERATION.LOGGED_OUT_DUE_TO_IDLE_STATE : CONSTANTS.LOGS_OPERATION.LOG_OUT,
        doneBy: payload.user.id
    };
    await SERVICES.logsService.create(logData);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOGGED_OUT_SUCCESSFULLY);
}

/**
 * approving and rejecting user
 */
userController.approveOrRejectUser = async (payload) => {
    let userData = await SERVICES.userService.getUser({ email: payload.email });
    await SERVICES.userService.updateUser({ email: payload.email },
        {
            ...((payload.status == CONSTANTS.USER_STATUS.Rejected) && { isAccountVerified: false, isSuspended: false }),
            status: payload.status,
            ...(payload.rejectionReason && { rejectionReason: payload.rejectionReason })
        });
    // add logs into the system
    let logData = {
        operation: payload.status == CONSTANTS.USER_STATUS.Approved ? CONSTANTS.LOGS_OPERATION.APPROVE_USER : CONSTANTS.LOGS_OPERATION.REJECT_USER,
        doneBy: payload.user.id,
        doneTo: userData.id
    };
    await SERVICES.logsService.create(logData);
    let succ_msg;
    if (payload.status == CONSTANTS.USER_STATUS.Approved) {
        succ_msg = CONSTANTS.MESSAGES.USER_APPROVED;
        await utils.sendEmail(payload.email, { navigationLink: CONFIG.UI_PATHS.BASE_PATH, name: userData.firstName }, CONSTANTS.EMAIL_TYPES.ACCOUNT_APPROVED);
    } else if (payload.status == CONSTANTS.USER_STATUS.Rejected) {
        succ_msg = CONSTANTS.MESSAGES.USER_REJECTED;
        let navigationLink = `${CONFIG.UI_PATHS.BASE_PATH}/auth/edit/${userData.id}`;
        await utils.sendEmail(payload.email, { navigationLink, name: userData.firstName, rejectionReason: payload.rejectionReason }, CONSTANTS.EMAIL_TYPES.ACCOUNT_REJECTED);
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
        data = await SERVICES.userService.getUser({ id: payload.user.id }, { exclude: ['warehouseCode', 'password', 'otp'] }, false, { exclude: ['permissions', 'createdAt', 'updatedAt'] });
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_PROFILE_FETCHED_SUCCESSFULLY), { data });
}

/**
 * forgot password controller
 */
userController.forgotPassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ email: payload.email }, { excludes: ['password'] });
    if (user.isSuspended) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.FORGOT_PASSWORD,
            error: CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED,
            isError: true,
            module: 'USER',
            doneBy: user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_SUSEPENDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    if (user) {
        if (user.resetPasswordToken) {
            try {
                let resetTokenData = utils.decryptJwt(user.resetPasswordToken);
                let messageTime = moment(new Date()).diff(new Date(resetTokenData.timestamp), 'minutes');
                if (messageTime <= CONSTANTS.DEFAULTS.FORGOT_PASSWORD_EMAIL_TIMING) {
                    await SERVICES.logsService.create({
                        operation: CONSTANTS.LOGS_OPERATION.FORGOT_PASSWORD,
                        error: CONSTANTS.MESSAGES.CONFIRMATION_LINK_ALREADY_SENT.replace('@time', moment.utc(moment.duration(((120 - messageTime) * 60), "seconds").asMilliseconds()).format("HH:mm")),
                        isError: true,
                        module: 'USER',
                        doneBy: user.id
                    })
                    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CONFIRMATION_LINK_ALREADY_SENT.replace('@time', moment.utc(moment.duration(((120 - messageTime) * 60), "seconds").asMilliseconds()).format("HH:mm")), CONSTANTS.ERROR_TYPES.BAD_REQUEST);
                }
            } catch (err) {
            }
        }
        let resetPasswordToken = utils.encryptJwt({
            role: user.role,
            userId: user.id,
            timestamp: new Date()
        });
        user.resetPasswordToken = resetPasswordToken;
        user.userCreatedOwnPassword = true;
        await user.save();
        let resetPasswordLink = `${CONFIG.UI_PATHS.BASE_PATH}${CONFIG.UI_PATHS.RESET_PASSWORD_PATH}/${resetPasswordToken}`;
        try {
            await utils.sendEmail(user.email, { resetPasswordLink, name: user.firstName }, CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD_EMAIL);
        } catch (err) {
            console.log("forgot password email: ", err)
        }
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.EMAIL_SENT_TO_REGISTERED_EMAIL_WITH_RESET_PASSWORD_LINK);
    }
    await SERVICES.logsService.create({
        operation: CONSTANTS.LOGS_OPERATION.FORGOT_PASSWORD,
        error: CONSTANTS.MESSAGES.NO_USER_FOUND_WITH_THIS_EMAIL,
        isError: true,
        module: 'USER'
    })
    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.NO_USER_FOUND_WITH_THIS_EMAIL, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
}

/**
 * reset password controller
 */
userController.resetPassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ resetPasswordToken: payload.token }, null);
    await SERVICES.userService.updateUser({ id: user.id }, { password: payload.password, userCreatedOwnPassword: true, lastPasswordUpdated: new Date(), isBlocked: false, resetPasswordToken: null });
    // add logs for this operation
    await SERVICES.logsService.create({
        operation: CONSTANTS.LOGS_OPERATION.PASSWORD_RESET,
        doneBy: user.id
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESSFULLY);
}

/**
 * suspend user
 */
userController.suspendUser = async (payload) => {
    await SERVICES.userService.updateUser({ id: payload.userId }, { isSuspended: payload.isSuspended });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_SUSEPENDED);
}

/**
 * change password controller
 */
userController.changePassword = async (payload) => {
    let user = await SERVICES.userService.getUser({ id: payload.user.id }, { attributes: ['password'] });
    if (utils.compareHash(payload.password, user.password)) {
        await SERVICES.userService.updateUser({ id: user.id }, { password: payload.newPassword, lastPasswordUpdated: new Date() });
        // add logs for this operation
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.PASSWORD_CHANGED,
            doneBy: user.id
        });
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PASSWORD_RESET_SUCCESSFULLY);
    }
    await SERVICES.logsService.create({
        operation: CONSTANTS.LOGS_OPERATION.PASSWORD_CHANGED,
        error: CONSTANTS.MESSAGES.CURRENT_PASSWORD_NOT_MATCHED,
        isError: true,
        module: 'USER',
        doneBy: user.id
    })
    throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.CURRENT_PASSWORD_NOT_MATCHED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
}

/**
 * verify OTP controller
 */
userController.verifyOtp = async (payload) => {
    let data = await SERVICES.userService.verifyOtp({ email: payload.email }, payload.otp);
    if (!data.status) {
        if (data.code === CONSTANTS.OTP_STATUSES.INVALID_OTP) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.VERIFY_OTP,
                error: CONSTANTS.MESSAGES.INVALID_OTP,
                isError: true,
                module: 'USER'
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.INVALID_OTP, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        } else if (data.code === CONSTANTS.OTP_STATUSES.OTP_EXPIRED) {
            await SERVICES.logsService.create({
                operation: CONSTANTS.LOGS_OPERATION.VERIFY_OTP,
                error: CONSTANTS.MESSAGES.OTP_EXPIRED,
                isError: true,
                module: 'USER'
            })
            throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.OTP_EXPIRED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
        }
    }
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY);
}

/**
 * resend OTP
 */
userController.resendOTP = async (payload) => {
    let user = await SERVICES.userService.getUser({ email: payload.email }, { excludes: ['password'] });
    // Sending OTP to the registered user
    if (user) {
        if (payload.pendingVerification) {
            if (!user.isAccountVerified) {
                return HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_ALREADY_VERIFIED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
            }
        }
        await generateOTPAndSendToUser(user)
        return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OTP_RESENT);
    } else {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.RESEND_OTP,
            error: CONSTANTS.MESSAGES.ACCOUNT_NOT_FOUND,
            isError: true,
            module: 'USER'
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_NOT_FOUND, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
}

/**
 * get filters
 */
userController.getFilters = async (payload) => {
    let data = await SERVICES.userService.getFilters({
        isDeleted: false,
        ...(payload.user.role == CONSTANTS.USER_ROLES.ADMIN ? { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] ? {
            [Op.or]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['CUSTOMS CLERK'] ? {
            [Op.or]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES.ADMIN } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS CLERK'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['API CONSUMER'] ? {
            [Op.or]: [
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['CUSTOMS CLERK'] } },
                { role: { [Op.ne]: CONSTANTS.USER_ROLES['API CONSUMER'] } }
            ]
        } : {}),
        ...(payload.user.role == CONSTANTS.USER_ROLES['WAREHOUSE MANAGER'] ? {
            [Op.or]: [
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
    let data = await SERVICES.userService.deleteUser({ id: payload.id });
    if (!data) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.DELETE_USER,
            error: CONSTANTS.MESSAGES.ACCOUNT_CANNOT_BE_DELETED,
            isError: true,
            module: 'USER',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ACCOUNT_CANNOT_BE_DELETED, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    // add logs for this action
    await SERVICES.logsService.create({
        doneTo: payload.id,
        doneBy: payload.user.id,
        operation: CONSTANTS.LOGS_OPERATION.DELETE_USER
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.USER_DELETED);
}

/**
 * get permissions
 */
userController.getPermissions = async (payload) => {
    let data = await SERVICES.roleService.fetchRole({ id: payload.user.role }, ['permissions']);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PERMISSIONS_FETCHED), { data });
}

/**
 * get OTP
 */
userController.getOTP = async (payload) => {
    let user = await SERVICES.userService.getUser({ id: payload.id });
    await generateOTPAndSendToUser(user);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OTP_SENT_SUCCESSFULLY);
}

/******************************************** LOGS CONTROLLER METHODS ********************************************/

/**
 * list logs controller
 */
userController.listLogs = async (payload) => {
    if (!payload.endDate) {
        payload.endDate = payload.startDate;;
    }
    // 1 for user and 2 for system logs
    let criteria = {
        ...(
            payload.type == 1 &&
            {
                operation:
                {
                    [Op.in]: [
                        CONSTANTS.LOGS_OPERATION.APPROVE_USER,
                        CONSTANTS.LOGS_OPERATION.REGISTER_USER,
                        CONSTANTS.LOGS_OPERATION.REJECT_USER,
                        CONSTANTS.LOGS_OPERATION.REASSIGN_ROLE,
                        CONSTANTS.LOGS_OPERATION.SUSPEND_USER,
                        CONSTANTS.LOGS_OPERATION.ADD_USER,
                        CONSTANTS.LOGS_OPERATION.UNSUSPEND_USER,
                        CONSTANTS.LOGS_OPERATION.LOGIN_ATTEMPT_FAILED,
                        CONSTANTS.LOGS_OPERATION.DELETE_USER,
                        CONSTANTS.LOGS_OPERATION.LOGGED_OUT_DUE_TO_IDLE_STATE,
                        CONSTANTS.LOGS_OPERATION.LOG_OUT,
                        CONSTANTS.LOGS_OPERATION.LOG_IN,
                        CONSTANTS.LOGS_OPERATION.PASSWORD_RESET,
                        CONSTANTS.LOGS_OPERATION.CHANGE_PASSWORD,
                        CONSTANTS.LOGS_OPERATION.PROFILE_UPDATED,
                        CONSTANTS.LOGS_OPERATION.REGISTER_USER,
                        CONSTANTS.LOGS_OPERATION.FORGOT_PASSWORD,
                        CONSTANTS.LOGS_OPERATION.VERIFY_OTP,
                        CONSTANTS.LOGS_OPERATION.RESEND_OTP
                    ]
                }
            }),
        ...(payload.type == 2 && {
            operation:
            {
                [Op.in]: [
                    CONSTANTS.LOGS_OPERATION.REJECT_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.SUBMIT_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.APPROVE_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.RESUBMIT_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.ITEMS_RACKED,
                    CONSTANTS.LOGS_OPERATION.UPLOAD_RACKED_GOODS,
                    CONSTANTS.LOGS_OPERATION.GROUP_ITEMS,
                    CONSTANTS.LOGS_OPERATION.RESET_RACKED_ITEMS,
                    CONSTANTS.LOGS_OPERATION.ADD_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.DELETE_DECLARATION,
                    CONSTANTS.LOGS_OPERATION.UNGROUP_ITEMS,
                    CONSTANTS.LOGS_OPERATION.VARIANCE_REPORT_GENERATED,
                    CONSTANTS.LOGS_OPERATION.UPDATE_STOCK,
                    CONSTANTS.LOGS_OPERATION.ADD_ROLE,
                    CONSTANTS.LOGS_OPERATION.DELETE_ROLE,
                    CONSTANTS.LOGS_OPERATION.UPDATE_ROLE
                ]
            }
        }),
        ...(payload.operation && { operation: payload.operation }),
        isError: payload.isError == 'false' ? false : true,
        ...((payload.startDate && payload.endDate) && {
            [Op.and]: [
                { createdAt: { [Op.gte]: moment(new Date(payload.startDate)).startOf('day') } },
                { createdAt: { [Op.lte]: moment(new Date(payload.endDate)).endOf('day') } }
            ]
        })
    };
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let pagination = {
        offset: payload.skip,
        limit: payload.limit
    }
    let data = await SERVICES.logsService.listLogs(criteria, false, payload.doerRole, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOGS_FETCHED), { data })
}

/**
 * Get log filters
 */
userController.getLogFilters = async (payload) => {
    let data = await SERVICES.logsService.getLogFilters(payload.type, payload.errorLogsOnly, payload.user.id);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.FILTERS_FETCHED), { data })
}

/**
 * get error logs for role other than admin 
 */
userController.getErrorlogs = async (payload) => {
    if (!payload.endDate) {
        payload.endDate = payload.startDate;;
    }
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let pagination = {
        offset: payload.skip,
        limit: payload.limit
    }
    let criteria = {
        ...(payload.operation && { operation: payload.operation }),
        isError: true,
        doneBy: payload.user.id,
        ...((payload.startDate && payload.endDate) && {
            [Op.and]: [
                { createdAt: { [Op.gte]: moment(new Date(payload.startDate)).startOf('day') } },
                { createdAt: { [Op.lte]: moment(new Date(payload.endDate)).endOf('day') } }
            ]
        })
    }
    let data = await SERVICES.logsService.listLogs(criteria, false, false, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LOGS_FETCHED), { data })
}

module.exports = userController;
