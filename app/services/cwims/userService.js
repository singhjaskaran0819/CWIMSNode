'use strict';

const MODELS = require(`../../models`);
const utils = require('../../utils/utils');
const _ = require('lodash');
const CONSTANTS = require('../../utils/constants');
const roleService = require('./roleService');
const { warehouseModel, userModel, roleModel } = require('../../models');

let userService = {};

/**
 * listUser
 */
userService.listUser = async (criteria = false, attributes = false, pagination) => {
    return await userModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        include: [
            {
                model: roleModel,
                attributes: ['id', 'title', 'nature']
            }
        ],
        ...pagination
    })
}

/**
 * function to get user.
 */
userService.getUser = async (criteria, attributes, withoutJoin = false, roleAttributes = false) => {
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
        attributes: ['country', 'role', 'city'],
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

    return { cityData: _.uniq(cityData), countryData: _.uniq(countryData), roleData: _.uniqBy(roleData, 'role') }
}

/**
 * verify OTP service method
 */
userService.verifyOtp = async (criteria, otp) => {
    let user = await userService.getUser(criteria, { excludes: ['password'] }, true)
    let otpData = utils.decryptJwt(user.otp);
    // TODO: removal of code after implementing below code
    if (otpData.otp == otp) {
        user.otp = null;
        user.isAccountVerified = true;
        await user.save();
        return true;
    }
    return false;
    // TODO

    // let duration = moment.duration(moment(otpData.tokenExpiresAt).diff(moment(new Date())));
    // let minutes = (duration.asMinutes()) * -1;
    // if (otpData.otp !== otp)
    //     return { code: CONSTANTS.OTP_STATUSES.INVALID_OTP, status: false };
    // if (minutes > 10) {
    //     user.otp = null;
    //     await user.save();
    //     return { code: CONSTANTS.OTP_STATUSES.OTP_EXPIRED, status: false }
    // }
}

/**
 * deleting user permanently
 */
userService.deleteUser = async (criteria) => {
    return await userModel.destroy({ where: criteria });
}

module.exports = userService;
