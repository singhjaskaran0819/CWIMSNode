"use strict";

const HELPERS = require("../../helpers");
const CONSTANTS = require('../../utils/constants');
const SERVICES = require('../../services');
const _ = require('lodash');
const utils = require('../../utils/utils');

let roleController = {};

/**
 * remove nested empty objects and arrays from inside an object
 */
function removeNestedEmptyObjectsAndArrays(object) {
    Object.keys(object).forEach(item => {
        if (_.isArray(object[`${item}`])) {
            if (object[`${item}`].length === 0) {
                delete object[`${item}`]
            }
        } else if (_.isPlainObject(object[`${item}`])) {
            if (Object.keys(object[`${item}`]).length === 0) {
                delete object[`${item}`]
            } else {
                Object.keys(object[`${item}`]).forEach(item1 => {
                    if (_.isArray(object[`${item}`][`${item1}`])) {
                        if (object[`${item}`][`${item1}`].length === 0) {
                            delete object[`${item}`][`${item1}`];
                            if (Object.keys(object[`${item}`]).length === 0)
                                delete object[`${item}`];
                        }
                    }
                })
            }
        }
    })
    return object;
}

/**
 * add new role controller 
 */
roleController.addNewRole = async (payload) => {
    payload.title = payload.title.toString().toLowerCase();
    payload.nature = CONSTANTS.ROLE_NATURE.BUSINESS;
    let checkIfAlreadyExisted = await SERVICES.roleService.fetchRole({ title: payload.title });
    if (checkIfAlreadyExisted) {
        await SERVICES.logsService.create({
            operation: CONSTANTS.LOGS_OPERATION.ADD_ROLE,
            error: CONSTANTS.MESSAGES.ROLES_ALREADY_EXISTS,
            isError: true,
            module: 'ROLE',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ROLES_ALREADY_EXISTS, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    payload.permissions = removeNestedEmptyObjectsAndArrays(payload.permissions);
    payload.permissions = { ...payload.permissions, ...{ dashboard: ["view"] } };
    await SERVICES.roleService.addNewRole(payload);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_ADDED)
}

/**
 * fetch roles controller
 */
roleController.fetchRoles = async (payload) => {
    let criteria;
    let pagination = {
        offset: payload.skip,
        limit: payload.limit
    }
    if (payload.type) {
        criteria = {
            type: payload.type
        }
    } else {
        criteria = false
    }
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.roleService.fetchRoles(criteria, ['id', 'title', 'permissions', 'nature', 'type'], pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_LIST_FETCHED), { data })
}

/**
 * update role
 */
roleController.updateRole = async (payload) => {
    await SERVICES.roleService.updateRole({ id: payload.id }, payload);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_UPDATED);
}

/**
 * fetch role by Id
 */
roleController.fetchRole = async (payload) => {
    let data = await SERVICES.roleService.fetchRole({ id: payload.id });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLE_FETCHED), { data });
}

/**
 * delete role by Id
 */
roleController.deleteRole = async (payload) => {
    let checkIfUsersAssociated = await SERVICES.roleService.fetchUsersByRoles({
        role: payload.id
    })
    if (checkIfUsersAssociated && checkIfUsersAssociated.length !== 0) {
        return HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.USERS_ASSOCIATED_WITH_USERS, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    }
    let data = await SERVICES.roleService.deleteRole({ id: payload.id });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ROLES_DELETED);
}

module.exports = roleController;
