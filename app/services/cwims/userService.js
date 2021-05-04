'use strict';

const MODELS = require(`../../models`);
const utils = require('../../utils/utils');
const _ = require('lodash');
const CONSTANTS = require('../../utils/constants');
const moment = require('moment');
const { warehouseModel, userModel, roleModel, inventoryModel, warehouseLocationModel } = require('../../models');
const { USER_STATUS } = require('../../utils/constants');

let userService = {};

/**
 * listUser
 */
userService.listUser = async (criteria = false, attributes = false, pagination, sort = {}) => {
    return await userModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        include: [
            {
                model: roleModel,
                attributes: ['id', 'title', 'nature', 'type']
            }
        ],
        ...pagination,
        ...sort
    })
}

/**
 * function to get user.
 */
userService.getUser = async (criteria, attributes = false, withoutJoin = false, roleAttributes = false) => {
    let query = {
        where: criteria,
        ...(attributes && { attributes }),
        include: [
            ...(!withoutJoin ? [{
                model: warehouseModel
            }] : []),
            {
                model: roleModel,
                ...(roleAttributes && { attributes: roleAttributes })
            }
        ]
    };
    return await MODELS.userModel.findOne(query);
};

/**
 * function to create user.
 */
userService.createUser = async (dataToSave) => {
    return await MODELS.userModel.create(dataToSave);
};

/**
 * update user
 */
userService.updateUser = async (criteria, dataToUpdate) => {
    return await MODELS.userModel.update(dataToUpdate, { where: criteria });
}

/**
 * get filters
 */
userService.getFilters = async (criteria = false) => {
    let data = await userModel.findAll({
        ...(criteria && { where: criteria }),
        attributes: ['country', 'role', 'city', 'status'],
        include: [
            {
                model: roleModel,
                attributes: ['id', 'title', 'nature']
            }
        ]
    });
    let countryData = data.map(item => {
        return item.country;
    });
    let cityData = data.map(item => {
        return item.city;
    });
    let roleData = data.map(item => {
        return {
            role: item.userrole.id,
            roleName: item.userrole.title
        }
    });
    let statusData = data.map(item => {
        return {
            statusCode: item.status,
            status: _.invert(USER_STATUS)[item.status].toLowerCase()
        }
    });

    return { cityData: _.uniq(cityData), countryData: _.uniq(countryData), roleData: _.uniqBy(roleData, 'role'), statusData: _.uniqBy(statusData, 'statusCode') }
}

/**
 * verify OTP service method
 */
userService.verifyOtp = async (criteria, otp) => {
    let user = await userService.getUser(criteria, { excludes: ['password'] }, true)
    if (!user.otp) {
        return { code: CONSTANTS.OTP_STATUSES.INVALID_OTP, status: false }
    }
    let otpData = utils.decryptJwt(user.otp);
    let duration = moment.duration(moment(otpData.tokenExpiresAt).diff(moment(new Date())));
    let minutesRemaining = duration.asMinutes();
    if (otpData.otp !== otp)
        return { code: CONSTANTS.OTP_STATUSES.INVALID_OTP, status: false };
    if (minutesRemaining <= 0) {
        user.otp = null;
        await user.save();
        return { code: CONSTANTS.OTP_STATUSES.OTP_EXPIRED, status: false }
    }
    user.otp = null;
    user.isAccountVerified = true;
    await user.save();
    return { code: CONSTANTS.OTP_STATUSES.VERIFIED, status: true }
}

/**
 * deleting user
 */
userService.deleteUser = async (criteria) => {
    let warehouseLocTrans = await warehouseLocationModel.findOne({
        where: { contactPerson: criteria.id }
    });
    let userData = await userModel.findOne({ where: criteria });
    let flag = false;
    if (userData.status == CONSTANTS.USER_STATUS.Pending) {
        flag = true;
    } else if (
        (warehouseLocTrans) ||
        (userData.warehouseCode != undefined) ||
        userData.status != CONSTANTS.USER_STATUS.Rejected
    ) {
        flag = false;
    }
    if (flag)
        return await userModel.update({ isDeleted: true, isAccountVerified: false, status: USER_STATUS.Deleted }, { where: criteria });
    return false;
}

/**
 * deleting user permanently
 */
userService.destroyUserData = async (criteria) => {
    return await userModel.destroy({ where: criteria });
}

module.exports = userService;