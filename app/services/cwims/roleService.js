'use strict';

const { roleModel, userModel } = require('../../models');
const _ = require('lodash');
const { ROLE_TYPE } = require('../../utils/constants')

let roleService = {};

/**
 * add new role
 */
roleService.addNewRole = async (dataToSave) => {
    return await roleModel.create(dataToSave);
}

/**
 * update role by id
 */
roleService.updateRole = async (criteria, dataToUpdate) => {
    return await roleModel.update(dataToUpdate, { where: criteria });
}

/**
 * delete role by id
 */
roleService.deleteRole = async (criteria) => {
    return await roleModel.destroy({ where: criteria });
}

/**
 * fetch role by ID
 */
roleService.fetchRole = async (criteria = false, attributes = false) => {
    return await roleModel.findOne({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes })
    })
}

/**
 * fetch roles
 */
roleService.fetchRoles = async (criteria = false, attributes = false, pagination, sort = {}) => {
    return await roleModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...pagination,
        ...(attributes && { attributes }),
        ...sort
    });
}

/**
 * fetch roles
 */
roleService.fetchUsersByRoles = async (criteria = false, attributes = false) => {
    return await userModel.findAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes })
    });
}

module.exports = roleService;
