'use strict';

const { logsModel, userModel, roleModel, declarationModel } = require('../../models');
const _ = require('lodash');
const { Op } = require('sequelize')
const { LOGS_OPERATION } = require('../../utils/constants')

let logsService = {};

/**
 * list logs
 */
logsService.listLogs = async (criteria = false, attributes = false, doerRole = false, pagination = {}, sort = {}) => {
    let data = await logsModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        include: [
            {
                model: userModel,
                as: 'userDoneBy',
                ...(doerRole && { where: { role: doerRole } }),
                attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                include: [
                    {
                        model: roleModel,
                        attributes: ['id', 'title']
                    }
                ]
            },
            {
                model: userModel,
                as: 'userDoneTo',
                attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                include: [
                    {
                        model: roleModel,
                        attributes: ['id', 'title']
                    }
                ]
            },
            {
                model: declarationModel
            }
        ],
        ...pagination,
        ...sort
    });
    data.rows = data.rows.map(item => {
        item = item.toJSON();
        item.operation = _.invert(LOGS_OPERATION)[item.operation];
        item = _.omit(item, ['doneBy', 'doneTo', 'updatedAt']);
        return item;
    })
    return data;
}

/**
 * create logs
 */
logsService.create = async (dataToSave) => {
    return await logsModel.create(dataToSave);
}

/**
 * Get log filters
 */
logsService.getLogFilters = async (type, errorLogsOnly = false, loggedUserId = false) => {
    let operations = [
        ...(
            type == 1 ? [
                LOGS_OPERATION.APPROVE_USER,
                LOGS_OPERATION.REGISTER_USER,
                LOGS_OPERATION.REJECT_USER,
                LOGS_OPERATION.REASSIGN_ROLE,
                LOGS_OPERATION.SUSPEND_USER,
                LOGS_OPERATION.ADD_USER,
                LOGS_OPERATION.UNSUSPEND_USER,
                LOGS_OPERATION.LOGIN_ATTEMPT_FAILED,
                LOGS_OPERATION.DELETE_USER,
                LOGS_OPERATION.LOGGED_OUT_DUE_TO_IDLE_STATE,
                LOGS_OPERATION.LOG_OUT,
                LOGS_OPERATION.LOG_IN,
                LOGS_OPERATION.PASSWORD_RESET,
                LOGS_OPERATION.CHANGE_PASSWORD,
                LOGS_OPERATION.PROFILE_UPDATED,
                LOGS_OPERATION.REGISTER_USER,
                LOGS_OPERATION.FORGOT_PASSWORD,
                LOGS_OPERATION.VERIFY_OTP,
                LOGS_OPERATION.RESEND_OTP,
                LOGS_OPERATION.ADD_ROLE,
                LOGS_OPERATION.DELETE_ROLE,
                LOGS_OPERATION.UPDATE_ROLE
            ] : [
                LOGS_OPERATION.REJECT_DECLARATION,
                LOGS_OPERATION.SUBMIT_DECLARATION,
                LOGS_OPERATION.APPROVE_DECLARATION,
                LOGS_OPERATION.RESUBMIT_DECLARATION,
                LOGS_OPERATION.ITEMS_RACKED,
                LOGS_OPERATION.UPLOAD_RACKED_GOODS,
                LOGS_OPERATION.RESET_RACKED_ITEMS,
                LOGS_OPERATION.ADD_DECLARATION,
                LOGS_OPERATION.DELETE_DECLARATION,
                LOGS_OPERATION.GROUP_ITEMS,
                LOGS_OPERATION.UNGROUP_ITEMS,
                LOGS_OPERATION.VARIANCE_REPORT_GENERATED,
                LOGS_OPERATION.UPDATE_STOCK,
            ]
        )
    ]
    let filterData = await logsModel.findAll({
        where: {
            ...(errorLogsOnly && { doneBy: loggedUserId }),
            ...(type == 3 ? { isError: true } : { isError: false }),
            ...(type != 3 && {
                operation: {
                    [Op.in]: operations
                }
            })
        },
        include: [
            {
                model: userModel,
                as: 'userDoneBy',
                attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                include: [
                    {
                        model: roleModel,
                        attributes: ['id', 'title']
                    }
                ]
            },
            {
                model: userModel,
                as: 'userDoneTo',
                attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                include: [
                    {
                        model: roleModel,
                        attributes: ['id', 'title']
                    }
                ]
            },
            {
                model: declarationModel
            }
        ]
    })
    let doerRoleData = filterData.map(item => {
        item = item.toJSON();
        return {
            role: item.userDoneBy.userrole.id,
            title: item.userDoneBy.userrole.title
        };
    });
    let operationData = filterData.map(item => {
        item = item.toJSON();
        return {
            id: item.operation,
            operation: _.invert(LOGS_OPERATION)[item.operation]
        };
    });
    return {
        doerRoleData: _.uniqBy(doerRoleData, 'role'),
        operationData: _.uniqBy(operationData, 'id')
    }
}

module.exports = logsService;