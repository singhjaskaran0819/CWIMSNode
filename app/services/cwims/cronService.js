'use strict'

let cron = require('node-cron');
const MODELS = require('../../models');
const { USER_STATUS, EMAIL_TYPES } = require('../../utils/constants');
const _ = require('lodash');
const { Op } = require('sequelize');
const utils = require('../../utils/utils');
const CONFIG = require('../../../config');
const userService = require('./userService');
const { destroyUserData } = require('./userService');

let cronService = {};

/**
 * send Notification To Admin For Pending Requests
 */
cronService.notifyUsers = async () => {
    cron.schedule('00 00 00 * * *', async () => {
        await sendEmailsRegardingPendingRequests();
    })

    cron.schedule('00 00 17 * * *', async () => {
        await sendEmailsRegardingPendingRequests();
    })

    return true;
}

/**
 * function to destroy the data of users having no transaction 
 */
cronService.destroyUserHavingNoTransaction = async () => {
    cron.schedule('00 00 00 * * *', async () => {
        let users = await MODELS.userModel.findAll({ where: { isDeleted: true }, attributes: ['id', 'email', 'warehouseCode'] });
        let user_ids = users.map(item => {
            return item.id
        });
        let warehouseLocTransData = await MODELS.warehouseLocationModel.findAll({
            where: { contactPerson: { [Op.in]: user_ids } }
        });
        let usersHavingWarehouseCodes = users.filter(item => {
            return item.warehouseCode != undefined;
        })

        // merge all Ids
        warehouseLocTransData = warehouseLocTransData.map(item => {
            return item.contactPerson;
        })
        usersHavingWarehouseCodes = usersHavingWarehouseCodes.map(item => {
            return item.id;
        })
        let userIdsNotToBeDeleted = [...usersHavingWarehouseCodes, ...warehouseLocTransData];

        // add ids to array that will be deleted
        let usersToBeDeleted = [];
        user_ids.forEach(item => {
            if (!userIdsNotToBeDeleted.includes(item)) {
                usersToBeDeleted.push(item)
            }
        })
        await userService.destroyUserData({ id: { [Op.in]: usersToBeDeleted } });
        return true;
    });
}

/**
 * to check if the requests are pending
 */
async function checkIfPendingRequestExists() {
    return await MODELS.userModel.findAll({
        where: {
            status: USER_STATUS.Pending,
            isDeleted: false,
            isAccountVerified: true
        },
    });
}

/**
 * fetch all roles with permisssion of user management(approval/rejection)
 */
async function fetchRolesWithUserManagementPermissions() {
    let roleArray = await MODELS.roleModel.findAll();
    roleArray = roleArray.map(item => {
        if (item['permissions']['user-management'] && item['permissions']['user-management']['list-of-user'].includes('approve-reject-user')) {
            return item.id
        } else {
            return null
        }
    })
    roleArray = roleArray.filter(element => {
        return element !== null;
    })
    return roleArray;
}

/**
 * send emails to users regarding pending requests
 */
async function sendEmailsRegardingPendingRequests() {
    let pendingRequestdata = await checkIfPendingRequestExists();
    if (pendingRequestdata && pendingRequestdata.length > 0) {
        let rolesArray = await fetchRolesWithUserManagementPermissions();
        let userEmails = await MODELS.userModel.findAll({
            where: {
                status: USER_STATUS.Approved,
                isDeleted: false,
                role: {
                    [Op.in]: rolesArray
                }
            }
        })
        userEmails = userEmails.map(item => {
            return item.email
        })
        let receiverEmailsString = '';
        userEmails.forEach(item => {
            receiverEmailsString = receiverEmailsString + item + ', '
        })
        let data = {
            numberOfRequests: pendingRequestdata.length,
            navigationLink: `${CONFIG.UI_PATHS.BASE_PATH}${CONFIG.UI_PATHS.USER_LIST}`
        }
        return await utils.sendEmail(JSON.stringify(userEmails), data, EMAIL_TYPES.REGARDING_PENDING_REQUESTS)
    }
    return true;
}

module.exports = cronService;
