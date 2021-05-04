"use strict";

const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, DECLARATION_STATUS, UPLOAD_FILE_TYPE, ROLE_TYPE, LOGS_OPERATION } = require('../../utils/constants');
const SERVICES = require('../../services');
const commonFunctions = require('../../utils/utils');
const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');
const { warehouseLocationModel, warehouseModel } = require('../../models');

/**********************************
 ***** Declaration controller *****
 **********************************/
let declarationController = {};

/**
 * function to add declaration
 */
declarationController.addDeclaration = async (payload) => {
    // check if location exists
    let warehouseLocationExists = await SERVICES.warehouseService.fetchWarehouseLocationByCode({ code: payload.stock.locationCode });
    if (!warehouseLocationExists) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.ADD_DECLARATION,
            error: MESSAGES.WAREHOUSE_LOCATION_NOT_EXISTS,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.WAREHOUSE_LOCATION_NOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }
    // checking for the unique reference
    let referenceAlreadyExists = await SERVICES.declarationService.fetchDeclarationById({
        office: payload.office,
        year: payload.year,
        number: payload.number,
        serial: payload.serial,
        isDeleted: false,
        status: {
            [Op.ne]: DECLARATION_STATUS.REJECTED
        }
    })
    if (referenceAlreadyExists) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.ADD_DECLARATION,
            error: MESSAGES.DECLARATION_REFERENCE_SHOULD_BE_UNIQUE,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.DECLARATION_REFERENCE_SHOULD_BE_UNIQUE, ERROR_TYPES.BAD_REQUEST);
    }
    // check customs Value
    let tempPayload = JSON.parse(JSON.stringify(payload));
    let totalCustomsValue = 0;
    tempPayload.stock.receiptItems.forEach(item => {
        totalCustomsValue = totalCustomsValue + item.customsValue
    })
    // tempPayload.stock.receiptItems.reduce((total, elem) => total.customsValue += elem.customsValue);
    if (payload.stock.totalCustomsValue !== totalCustomsValue) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.ADD_DECLARATION,
            error: MESSAGES.CUSTOM_VALUE_MISMATCHED,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CUSTOM_VALUE_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
    }
    let lineNumbersToSave = tempPayload.stock.receiptItems.map(item => item.lineNumber);
    // let checkLineNumbersDuplicacy = await SERVICES.declarationService.fetchSADItems({ lineNumber: { [Op.in]: lineNumbersToSave } });
    if (commonFunctions.checkDuplicatesInArray(lineNumbersToSave)) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.ADD_DECLARATION,
            error: MESSAGES.LINE_NUMBER_ALREADY_EXISTS,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LINE_NUMBER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }
    let data = await SERVICES.declarationService.addDeclaration(payload);
    // add logs for this action
    await SERVICES.logsService.create({
        declarationId: data.declaration,
        doneBy: payload.user.id,
        operation: LOGS_OPERATION.ADD_DECLARATION
    });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.DECLARATION_ADDED);
}

/**
 * function to fetch received goods
 */
declarationController.fetchReceivedGoods = async (payload) => {
    let pagination = {
        offset: payload.skip,
        limit: payload.limit
    }
    let operator_whs_cond;
    if (payload.user.userrole.type === ROLE_TYPE.OPERATOR) {
        operator_whs_cond = {
            whs_code: payload.user.warehouseCode
        }
    }
    let criteria = {
        isDeleted: false,
        ...(payload.locationCode && { locationCode: payload.locationCode }),
        ...(payload.year && { year: payload.year }),
        ...(payload.serial && { serial: payload.serial }),
        ...(payload.number && { number: payload.number }),
        ...(payload.status && { status: payload.status }),
        ...((payload.dateReceived) && {
            [Op.and]: [
                { createdAt: { [Op.gte]: moment(new Date(payload.dateReceived)).startOf('day') } },
                { createdAt: { [Op.lte]: moment(new Date(payload.dateReceived)).endOf('day') } }
            ]
        })
    }
    let sort;
    if (payload.sortKey === 'warehouse') {
        sort = { order: [[{ model: warehouseLocationModel, as: 'warehouselocation' }, { model: warehouseModel, as: 'warehouse' }, 'name', ...(payload.sortDirection == 1 ? ['ASC'] : ['DESC'])]] }
    } else {
        sort = commonFunctions.createSortingObject(payload.sortKey, payload.sortDirection);
    }
    let data = await SERVICES.declarationService.fetchGoodsReceived(criteria, false, operator_whs_cond, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FETCH_RECEIVED_GOODS), { data });
};

/**
 * function to fetch declaration by Id
 */
declarationController.fetchDeclarationById = async (payload) => {
    let data = await SERVICES.declarationService.fetchDeclarationById({ id: payload.id });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.DECLARATION_FETCHED), { data });
};

/**
 * fetch SAD items
 */
declarationController.fetchSADItems = async (payload) => {
    let pagination = {
        offset: payload.skip,
        limit: payload.limit
    }
    let sort = commonFunctions.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.declarationService.fetchSADItems({ declarationId: payload.id }, { exclude: ['updatedAt', 'declarationId'] }, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.SAD_ITEMS_FETCHED), { data });
}

/**
 * get filters
 */
declarationController.getFilters = async (payload) => {
    let data = await SERVICES.declarationService.getFilters();
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILTERS_FETCHED), { data });
}

/**
 * rack Items
 */
declarationController.rackItems = async (payload) => {
    // add sadItemId into every object of Items Array
    let items = payload.items.map(item => {
        return { ...item, ...(item.supplementryValue ? { supplementryValue: item.supplementryValue } : { supplementryValue: 0 }), ...{ sadItemId: payload.sadItemId } }
    }).map(item => {
        item.productID = item.productID.toString().trim()
        return item; 
    })
    items = items.reduce((acc, obj) => {
        let found = false;
        for (let i = 0; i < acc.length; i++) {
            if (acc[i].productID === obj.productID) {
                found = true;
                acc[i].customsValue = acc[i].customsValue + obj.customsValue;
                acc[i].qty = acc[i].qty + obj.qty;
                acc[i].supplementryValue = acc[i].supplementryValue + obj.supplementryValue;
                acc[i].weight = acc[i].weight + obj.weight;
            };
        }
        if (!found) {
            acc.push(obj);
        }
        return acc;
    }, []);
    let sadItemData = await SERVICES.declarationService.fetchSADItemByID({ id: payload.sadItemId });
    let totalWeight = 0;
    for (let i = 0; i <= items.length - 1; i++) {
        totalWeight = totalWeight + items[i].weight;
    }
    // total weight check
    if (sadItemData.weight != totalWeight) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.ITEMS_RACKED,
            error: MESSAGES.TOTAL_WEIGHT_MISMATCHED,
            isError: true,
            doneBy: payload.user.id,
            module: 'DECLARATION',
            declarationId: sadItemData.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.TOTAL_WEIGHT_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
    }
    await SERVICES.logsService.create({
        declarationId: sadItemData.declarationId,
        doneBy: payload.user.id,
        operation: LOGS_OPERATION.ITEMS_RACKED
    });
    await SERVICES.declarationService.rackItems(items, payload.sadItemId);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.RACK_ITEMS);
}

/**
 * fetch rack Items
 */
declarationController.fetchRackItems = async (payload) => {
    let sort = commonFunctions.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.declarationService.fetchRackItems({ sadItemId: payload.sadItemId }, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FETCH_RACK_ITEMS), { data });
}

/**
 * upload racked good's data via JSON
 */
declarationController.upload = async (payload) => {
    // check if declaration exists in the system
    let declarationData = await SERVICES.declarationService.fetchDeclarationById({ id: payload.declarationId });
    if (!declarationData || (declarationData && declarationData.isDeleted)) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.DECLARATION_NOT_EXISTS,
            isError: true,
            doneBy: payload.user.id,
            module: 'DECLARATION',
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.DECLARATION_NOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }
    let fileData = await commonFunctions.convertFileToJSONData(payload);
    // check if location exists or not
    if (!fileData.stock.locationCode) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.LOCATION_NOT_COMING,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LOCATION_NOT_COMING, ERROR_TYPES.BAD_REQUEST);
    }
    let loc_data = await SERVICES.warehouseService.fetchWarehouseLocationByCode({ code: fileData.stock.locationCode });
    if (!loc_data) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.WAREHOUSE_LOCATION_NOT_EXISTS,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.WAREHOUSE_LOCATION_NOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }

    // merging duplicate productID
    fileData.stock.receiptItems.forEach(item => {
        item.rackItems = item.rackItems.reduce((acc, obj) => {
            let found = false;
            for (let i = 0; i < acc.length; i++) {
                if (acc[i].productID === obj.productID) {
                    found = true;
                    acc[i].customsValue = acc[i].customsValue + obj.customsValue;
                    acc[i].qty = acc[i].qty + obj.qty;
                    // acc[i].supplementryValue = acc[i].supplementryValue + obj.supplementryValue;
                    acc[i].weight = acc[i].weight + obj.weight;
                };
            }
            if (!found) {
                acc.push(obj);
            }
            return acc;
        }, []);
    })

    // checking data regarding lineNumber if exists or not
    let tempData = JSON.parse(JSON.stringify(fileData.stock.receiptItems));
    tempData = tempData.map(item => {
        return item.lineNumber;
    })
    let checkIfLineNumberExists = await SERVICES.declarationService.fetchSADItems({ declarationId: payload.declarationId, lineNumber: { [Op.in]: tempData } });
    if (checkIfLineNumberExists.count !== tempData.length) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.LINE_NUMBER_NOT_EXISTS,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.LINE_NUMBER_NOT_EXISTS, ERROR_TYPES.BAD_REQUEST);
    }
    let sadItemsFromFile = fileData.stock.receiptItems;
    // check if the total custom value of coming stock and declaration stock is equal
    if (fileData.stock.totalCustomsValue != declarationData.totalCustomsValue) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.CUSTOM_VALUE_MISMATCHED,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CUSTOM_VALUE_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
    }
    // to check if any item have quantity 0
    let sadItemsData = await SERVICES.declarationService.fetchSADItems({ declarationId: payload.declarationId });
    sadItemsData = sadItemsData.rows.filter(item => {
        return item.qty > 0;
    });
    if (sadItemsData.length === 0) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.ALREADY_RACKED,
            isError: true,
            doneBy: payload.user.id,
            module: 'DECLARATION',
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ALREADY_RACKED, ERROR_TYPES.BAD_REQUEST);
    }
    let containsEmptyKeys = false;
    let dataToSave = [];
    // update sad items with rack items array
    let updatedSadItemsData = sadItemsData.map(item => {
        let dataSearched = _.find(sadItemsFromFile, { hsCode: item.hsCode, lineNumber: item.lineNumber });
        item.rackItems = dataSearched.rackItems.map(element => {
            element.sadItemId = item.id;
            return element
        });
        let totalCustomsValue = 0;
        let totalQuantity = 0;
        let totalWeight = 0;
        // calculating total quantity and customsValue
        item.rackItems.forEach(element => {
            totalCustomsValue = totalCustomsValue + element.customsValue;
            totalQuantity = totalQuantity + element.qty;
            totalWeight = totalWeight + element.weight;
        })
        // check total weight
        if (item.weight !== totalWeight) {
            SERVICES.logsService.create({
                operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
                error: MESSAGES.TOTAL_WEIGHT_MISMATCHED,
                isError: true,
                doneBy: payload.user.id,
                module: 'DECLARATION',
                declarationId: payload.declarationId
            })
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.TOTAL_WEIGHT_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
        }
        // update quantity and customsValue
        item.qty = item.qty - totalQuantity;
        // if total customsValue are matched "isRacked" will be true otherwise false
        if (item.initialQuantity == totalQuantity && item.customsValue == totalCustomsValue) {
            item.isRacked = true;
        } else if (item.initialQuantity != totalQuantity) {
            SERVICES.logsService.create({
                operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
                error: MESSAGES.QUANTITY_MISMATCHED,
                isError: true,
                module: 'DECLARATION',
                doneBy: payload.user.id,
                declarationId: payload.declarationId
            })
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.QUANTITY_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
        } else if (item.customsValue != totalCustomsValue) {
            SERVICES.logsService.create({
                operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
                error: MESSAGES.CUSTOM_VALUE_MISMATCHED,
                isError: true,
                module: 'DECLARATION',
                doneBy: payload.user.id,
                declarationId: payload.declarationId
            })
            throw HELPERS.responseHelper.createErrorResponse(MESSAGES.CUSTOM_VALUE_MISMATCHED, ERROR_TYPES.BAD_REQUEST);
        }
        return item;
    })
    updatedSadItemsData.forEach(item => {
        dataToSave = [...dataToSave, ...item.rackItems];
    })

    // Save updated SAD Items
    updatedSadItemsData.forEach(item => {
        item.save();
    })
    dataToSave = dataToSave.filter(item => {
        return item.qty > 0
    })
    dataToSave.forEach(element => {
        Object.keys(element).forEach(item => {
            if (element[item] === '') {
                containsEmptyKeys = true;
            }
        })
    })
    if (containsEmptyKeys) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS,
            error: MESSAGES.FILE_UPLOAD_ERROR,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.declarationId
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.FILE_UPLOAD_ERROR, ERROR_TYPES.BAD_REQUEST);
    }
    // add logs for this action
    await SERVICES.logsService.create({
        declarationId: payload.declarationId,
        doneBy: payload.user.id,
        operation: LOGS_OPERATION.UPLOAD_RACKED_GOODS
    });

    await SERVICES.declarationService.uploadRackItems(dataToSave);
    declarationData.isSadItemsRacked = true;
    await declarationData.save();
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.CSV_UPLOAD);
}

/**
 * approve/reject request
 */
declarationController.acceptOrRejectRequest = async (payload) => {
    let message = MESSAGES.ACCEPT_REJECT_REQUEST;
    if (payload.operation === DECLARATION_STATUS.APPROVED) {
        let data = await SERVICES.declarationService.fetchRackedItemsForPassingForward({ declarationId: payload.id });
        data = data.map(item => {
            return item.toJSON();
        })
        data = data.reduce((acc, obj) => {
            let found = false;
            for (let i = 0; i < acc.length; i++) {
                if (acc[i].productID === obj.productID) {
                    found = true;
                    acc[i].customsValue = acc[i].customsValue + obj.customsValue;
                    acc[i].qty = acc[i].qty + obj.qty;
                    acc[i].supplementryValue = acc[i].supplementryValue + obj.supplementryValue;
                    acc[i].weight = acc[i].weight + obj.weight;
                };
            }
            if (!found) {
                acc.push(obj);
            }
            return acc;
        }, []);
        let productIDs = data.map(res => res.productID);
        let inventoryData = await SERVICES.inventoryService.list({
            productID: {
                [Op.in]: productIDs
            }
        }, false, {}, false, false, {}, false);
        let promises = [];
        inventoryData.list.forEach(item => {
            let product = _.find(data, { productID: item.productID });
            let customsValue = item.remainingQuantity * item.unitValue;
            item.remainingQuantity = item.remainingQuantity + product.qty;
            item.customsValue = Number(customsValue + product.customsValue).toFixed(3);
            // item.supValue = item.supValue + item.supplementryValue;
            data = data.filter(item1 => {
                return item1.productID != product.productID;
            });
            promises.push(item.save());
        })
        await Promise.all(promises);
        // store rack items to inventory in case of approval
        data = data.map(item => {
            return {
                productID: item.productID,
                year: item.saditem.declaration.year,
                number: item.saditem.declaration.number,
                serial: item.saditem.declaration.serial,
                locationCode: item.saditem.declaration.locationCode,
                customsValue: item.customsValue,
                unitValue: parseFloat(item.customsValue / item.qty).toFixed(3),
                weight: item.saditem.weight,
                tariffCode: item.tariffCode ? item.tariffCode : null,
                description: item.description,
                initialQuantity: item.qty,
                remainingQuantity: item.qty
            }
        });
        await SERVICES.inventoryService.create(data);
        message = message.replace('@operation', 'approved')
    } else if (payload.operation === DECLARATION_STATUS.REJECTED) {
        let dec_data = await SERVICES.declarationService.fetchDeclarationById({ id: payload.id });
        await SERVICES.declarationService.createDeclarationMessageModel({
            officer: payload.user.id,
            reason: payload.reason,
            operator: dec_data.submittedBy,
            declarationId: payload.id
        });
        message = message.replace('@operation', 'rejected')
    }
    // update declaration
    await SERVICES.declarationService.updateDeclaration({ id: payload.id }, { status: payload.operation });
    // add logs for this action
    await SERVICES.logsService.create({
        declarationId: payload.id,
        doneBy: payload.user.id,
        operation: payload.operation === DECLARATION_STATUS.APPROVED ? LOGS_OPERATION.APPROVE_DECLARATION : LOGS_OPERATION.REJECT_DECLARATION
    });
    return HELPERS.responseHelper.createSuccessResponse(message);
}

/**
 * reset racked items
 */
declarationController.resetRackedItems = async (payload) => {
    if (payload.declarationId) {
        await SERVICES.declarationService.resetRackedItemsByDeclaration({
            declarationId: payload.declarationId
        });
    } else {
        await SERVICES.declarationService.resetRackedItems({
            id: payload.sadItemId
        });
    }
    let sadItemData;
    if (payload.sadItemId)
        sadItemData = await SERVICES.declarationService.fetchSADItemByID({ id: payload.sadItemId });
    // add logs for this action
    await SERVICES.logsService.create({
        declarationId: payload.sadItemId ? sadItemData.declarationId : payload.declarationId,
        doneBy: payload.user.id,
        operation: LOGS_OPERATION.RESET_RACKED_ITEMS
    });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.RESET_RACKED_ITEMS);
}

/**
 * submit request method
 */
declarationController.submitRequest = async (payload) => {
    // to check if all items are already racked or not
    let checkDataIfRackedAlready = await SERVICES.declarationService.fetchSADItems({ declarationId: payload.id, isRacked: false });
    if (checkDataIfRackedAlready && checkDataIfRackedAlready.count > 0) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.SUBMIT_DECLARATION,
            error: MESSAGES.NOT_RACKED_YET,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_RACKED_YET, ERROR_TYPES.BAD_REQUEST);
    }
    let dataToUpdate = {
        submittedBy: payload.user.id,
        ...(payload.resubmit ? { status: DECLARATION_STATUS["RE-SUBMITTED"] } : { status: DECLARATION_STATUS.SUBMITTED })
    }
    // add logs for this action
    await SERVICES.logsService.create({
        declarationId: payload.id,
        doneBy: payload.user.id,
        operation: payload.resubmit ? LOGS_OPERATION.RESUBMIT_DECLARATION : LOGS_OPERATION.SUBMIT_DECLARATION
    });
    await SERVICES.declarationService.updateDeclaration({ id: payload.id }, dataToUpdate);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.DECLARATION_REQUEST_SUBMIT);
}

/**
 * method to get messages on decalations
 */
declarationController.getMessages = async (payload) => {
    let data = await SERVICES.declarationService.getMessages({ declarationId: payload.id }, false, { limit: payload.limit, offset: payload.skip });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FETCH_MESSAGES), { data });
}

/**
 * method to reply to messages
 */
declarationController.replytoMessage = async (payload) => {
    await SERVICES.declarationService.updateDeclarationMessageModel({ id: payload.id }, { reply: payload.reply });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.REPLY_TO_MESSAGES);
}

/**
 * update racked items
 */
declarationController.updateRackedItems = async (payload) => {
    await SERVICES.declarationService.updateRackedItems({ id: payload.id }, payload);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.RACKED_ITEM_UPDATED);
}

/**
 * delete declaration
 */
declarationController.deleteDeclaration = async (payload) => {
    let declarationData = await SERVICES.declarationService.fetchDeclarationById({ id: payload.id });
    if (declarationData.status != DECLARATION_STATUS.PENDING) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.DELETE_DECLARATION,
            error: MESSAGES.DECLARATION_CANNOT_BE_DELETED,
            isError: true,
            module: 'DECLARATION',
            doneBy: payload.user.id,
            declarationId: payload.id
        })
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.DECLARATION_CANNOT_BE_DELETED, ERROR_TYPES.BAD_REQUEST);
    }
    await SERVICES.declarationService.deleteDeclaration({ id: payload.id });
    // creates logs
    await SERVICES.logsService.create({
        declarationId: payload.id,
        doneBy: payload.user.id,
        operation: LOGS_OPERATION.DELETE_DECLARATION
    });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.DECLARATION_DELETED);
}

module.exports = declarationController;