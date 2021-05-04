"use strict";

const HELPERS = require("../../helpers"),
    CONSTANTS = require('../../utils/constants'),
    SERVICES = require('../../services'),
    sequelize = require('sequelize'),
    { Op } = sequelize,
    utils = require('../../utils/utils'),
    { v4 } = require('uuid'),
    _ = require('lodash'),
    fs = require("fs"),
    { warehouseLocationModel, warehouseModel } = require('../../models'),
    { VARIANCE_REPORT_STATUSES, MESSAGES, STOCK_TAKE_STATUSES, LOGS_OPERATION } = require("../../utils/constants"),
    { json2csv } = require('json-2-csv');

/********************************
 ***** Inventory controller *****
 ********************************/
let inventoryController = {};

async function createCSV(jsonArray) {
    if (jsonArray.length === 0) {
        throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NO_DOWNLOAD_DATA, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    jsonArray = jsonArray.map(elem => {
        elem = elem.toJSON();
        elem.status = _.invert(VARIANCE_REPORT_STATUSES)[elem.status];
        elem.rejectionReason = elem.rejectionReason ? elem.rejectionReason : "NA";
        elem.createdAt = new Date(elem.createdAt).toLocaleDateString();
        delete elem.inventory;
        delete elem.id;
        delete elem.updatedAt;
        return elem;
    })
    try {
        json2csv(jsonArray, async (err, csv) => {
            if (err)
                console.log("JSON2CSV ERROR: => ", err);
            await fs.writeFileSync("public/varianceReports.csv", csv);
        }, { delimiter: { field: ";" } })
        return true;
    } catch (err) {
        console.log("TRY BLOCK ERROR: => ", err);
        return false;
    }
}

/**
 * list inventory
 */
inventoryController.listInventory = async (payload) => {
    let nestedConditions;
    let filters = {
        ...(payload.year && { year: payload.year }),
        ...(payload.status && { status: payload.status }),
        ...(payload.serial && { serial: payload.serial }),
        ...(payload.number && { number: payload.number }),
        ...(payload.tariffCode && { tariffCode: payload.tariffCode }),
        ...(payload.locationCode && { locationCode: payload.locationCode }),
        ...((payload.searchKey && payload.searchKey != "") && {
            [Op.or]: [
                { description: { [Op.like]: `%${payload.searchKey}%` } },
                { productID: { [Op.like]: `%${payload.searchKey}%` } }
            ]
        }),
    };
    if (payload.user.userrole.type == CONSTANTS.ROLE_TYPE.OPERATOR) {
        nestedConditions = {
            whs_code: payload.whs_code
        }
    } else if (payload.user.role == CONSTANTS.USER_ROLES.OFFICER) {

    } else {

    }

    let pagination = {
        limit: parseInt(payload.limit),
        offset: parseInt(payload.skip)
    };
    let sort;
    if (payload.sortKey === 'warehouse') {
        sort = {
            order: [
                [
                    { model: warehouseLocationModel, as: 'warehouselocation' },
                    { model: warehouseModel, as: 'warehouse' },
                    'name',
                    ...(payload.sortDirection == 1 ? ['ASC'] : ['DESC'])
                ]
            ]
        }
    } else if (payload.sortKey === 'location') {
        sort = {
            order: [
                [
                    { model: warehouseLocationModel, as: 'warehouselocation' },
                    'name',
                    ...(payload.sortDirection == 1 ? ['ASC'] : ['DESC'])
                ]
            ]
        }
    } else {
        sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    }
    let data = await SERVICES.inventoryService.list({}, nestedConditions, pagination, filters, {}, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.INVENTORY_LIST), { data })
}

/**
 * fetch inventory by ID
 */
inventoryController.fetchInventoryById = async (payload) => {
    let criteria = {
        ...(payload.id && { id: payload.id }),
        ...(payload.productID && { productID: payload.productID })
    }
    let data = await SERVICES.inventoryService.fetchById(criteria, {});
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.INVENTORY_FETCH_BY_ID), { data })
}

/**
 * get filters
 */
inventoryController.getFilters = async (payload) => {
    let data = await SERVICES.inventoryService.getFilters(payload.groupedItemsFlag, payload.varianceReports, payload.stockTake);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.FILTERS_FETCHED), { data })
}

/**
 * generate variance report controller
 */
inventoryController.generateVarianceReport = async (payload) => {
    await SERVICES.inventoryService.generateVarianceReport({ stocktakeSerial: payload.stocktakeSerial });
    // updating stock take
    await SERVICES.inventoryService.updateStockTake({ serial: payload.stocktakeSerial }, { status: STOCK_TAKE_STATUSES.PROVISIONALLY_CLOSED })
    // empty the buffer table data having product IDs
    await SERVICES.stockTakeBufferService.destroy({ stocktakeSerial: payload.stocktakeSerial });
    // add logs for this action
    await SERVICES.logsService.create({
        doneBy: payload.user.id,
        operation: CONSTANTS.LOGS_OPERATION.VARIANCE_REPORT_GENERATED
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.VARIANCE_REPORT_GENERATED);
}

/**
 * get variance reports controller
 */
inventoryController.getVarianceReports = async (payload) => {
    let pagination = {
        limit: payload.limit,
        offset: payload.skip
    }
    let criteria = {
        ...(payload.difference && payload.difference == 0 ? { difference: 0 } : {}),
        ...(payload.difference && payload.difference == 1 ? { difference: { [Op.gt]: 0 } } : {}),
        ...(payload.status && { status: payload.status }),
        ...(payload.locationCode && { locationCode: payload.locationCode }),
        ...(payload.user.userrole.type === CONSTANTS.ROLE_TYPE.OPERATOR && { warehouseCode: payload.user.warehouseCode })
    };
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.inventoryService.getVarianceReports(criteria, false, pagination, sort);
    if (payload.createCSV) {
        let flag = await createCSV(data.list);
        return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL), {
            data: {
                csvDownloadLink: `${process.env.SERVER_URL}/public/varianceReports.csv`
            }
        });
    }
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.VARIANCE_REPORT_FETCHED), { data });
}

/**
 * update stock controller
 */
inventoryController.updateStock = async (payload) => {
    // if (payload.reportId) {
    //     await SERVICES.inventoryService.updateNotFoundStock(payload.reportId, payload.operation);
    // } else {
    await SERVICES.inventoryService.updateStock(payload.products, payload.operation);
    // }
    // add logs for this action
    await SERVICES.logsService.create({
        doneBy: payload.user.id,
        operation: CONSTANTS.LOGS_OPERATION.UPDATE_STOCK
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.VARIANCE_REPORT_UPDATED);
}

/**
 * list stock-takes controller
 */
inventoryController.listStockTake = async (payload) => {
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.inventoryService.listStockTake(
        {
            ...(payload.locationCode && { locationCode: payload.locationCode }),
            ...(payload.year && { year: payload.year })
        },
        false,
        {
            offset: payload.skip,
            limit: payload.limit
        },
        sort
    );
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.LIST_STOCK_TAKE), { data });
}

/**
 * update stock controller
 */
inventoryController.getProductsForSpecificLocation = async (payload) => {
    let data = await SERVICES.inventoryService.getAllProducts({
        locationCode: payload.locationCode,
        ...(payload.subLocation && { subLocation: payload.subLocation }),
        productID: {
            [Op.like]: `%${payload.searchKey}%`
        }
    }, ['productID', 'description']);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.ALL_PRODUCTS_FETCHED), { data });
}

/**
 * group items
 */
inventoryController.groupItems = async (payload) => {
    let productsToSave = [];
    // check remaining quantities prior to group items
    let products = JSON.parse(JSON.stringify(payload.products));
    let checkItems = products.map(item => item.productId);
    let inventory_data = await SERVICES.inventoryService.list({
        productID: { [Op.in]: checkItems }
    }, false, {}, false, ['productID', 'remainingQuantity'])
    let grouped_inventory_data = await SERVICES.inventoryService.fetchGroupedItemsForConditions({ productID: { [Op.in]: checkItems } }, ['productID', [sequelize.fn('sum', sequelize.col('qty')), 'groupedQty']])
    grouped_inventory_data = grouped_inventory_data.map(item => item.toJSON())
    inventory_data = inventory_data.list.map(item => {
        item = item.toJSON();
        // overwrite the remainingQuantity with (remainingQuantity - groupedInvQty)
        // now remaining quantity is total remaining items in the inventory to be grouped
        let obj = _.find(grouped_inventory_data, { productID: item.productID });
        if (obj)
            item.remainingQuantity = item.remainingQuantity - obj.groupedQty;
        return item;
    })
    // now compare the remaning quantity with the incoming quantity so we can put some checks over it 
    let flagForGroupingItems = true;
    inventory_data.forEach(item => {
        let product = _.find(products, { productId: item.productID });
        let quantityToCheck = product.quantity * payload.groupQty;
        if (item.remainingQuantity < quantityToCheck)
            flagForGroupingItems = false;
    })
    if (!flagForGroupingItems) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.GROUP_ITEMS,
            error: MESSAGES.ITEM_QUANTITY_FOR_GROUPING_EXCEEDED,
            isError: true,
            module: 'INVENTORY',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.ITEM_QUANTITY_FOR_GROUPING_EXCEEDED, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    // end
    for (let i = 1; i <= payload.groupQty; i++) {
        let items = JSON.parse(JSON.stringify(payload.products));
        let id = v4();
        let combos = items.map(item => {
            item.comboId = id;
            return item
        })
        productsToSave = [...productsToSave, ...combos];
    }
    // check for duplicacy in grouped items model
    let data = await SERVICES.inventoryService.getGroupedItems({ productCode: payload.productCode }, false, false, {}, false);
    if (data && data.totalCount > 0) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.GROUP_ITEMS,
            error: MESSAGES.PRODUCT_IDS_PRESENT_IN_GROUPED_ITEMS,
            isError: true,
            module: 'INVENTORY',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.PRODUCT_IDS_PRESENT_IN_GROUPED_ITEMS, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    // check for duplicacy in inventory model
    data = await SERVICES.inventoryService.list({ productID: payload.productCode });
    if (data && data.totalCount > 0) {
        await SERVICES.logsService.create({
            operation: LOGS_OPERATION.GROUP_ITEMS,
            error: MESSAGES.PRODUCT_IDS_PRESENT_IN_INVENTORY,
            isError: true,
            module: 'INVENTORY',
            doneBy: payload.user.id
        })
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.PRODUCT_IDS_PRESENT_IN_INVENTORY, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    // assigning values
    payload.productsToCheck = payload.products;
    payload.products = productsToSave;
    let temp_data = await SERVICES.inventoryService.groupItems(payload);
    // add logs for this action
    await SERVICES.logsService.create({
        productCode: temp_data[0].productCode,
        doneBy: payload.user.id,
        operation: CONSTANTS.LOGS_OPERATION.GROUP_ITEMS
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.GROUP_ITEMS);
}

/**
 * get grouped items
 */
inventoryController.getGroupedItems = async (payload) => {
    let criteria, pagination = {
        limit: payload.limit,
        offset: payload.skip
    };
    if (payload.productCode && payload.itemData) {
        criteria = {
            productCode: payload.productCode
        }
    }
    // if any filter is applicable
    if (payload.locationCode) {
        criteria = {
            locationCode: payload.locationCode
        }
    }
    let nestedConditions;
    if (payload.user.userrole.type == CONSTANTS.ROLE_TYPE.OPERATOR) {
        nestedConditions = {
            whs_code: payload.user.warehouseCode
        }
    } else if (payload.user.role == CONSTANTS.USER_ROLES.OFFICER) {

    } else {

    }
    let sort;
    if (payload.sortKey === 'location') {
        sort = { order: [[{ model: warehouseLocationModel, as: 'warehouselocation' }, 'name', ...(payload.sortDirection == 1 ? ['ASC'] : ['DESC'])]] }
    } else if (payload.sortKey === 'warehouse') {
        sort = { order: [[{ model: warehouseLocationModel, as: 'warehouselocation' }, { model: warehouseModel, as: 'warehouse' }, 'name', ...(payload.sortDirection == 1 ? ['ASC'] : ['DESC'])]] }
    } else {
        sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    }
    let data = await SERVICES.inventoryService.getGroupedItems(criteria, nestedConditions, false, pagination, payload.itemData, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.GET_GROUPED_ITEMS), { data });
}

/**
 * ungroup items
 */
inventoryController.ungroupItems = async (payload) => {
    await SERVICES.inventoryService.destroy({ productCode: payload.productCode });
    // add logs for this action
    await SERVICES.logsService.create({
        productCode: payload.productCode,
        doneBy: payload.user.id,
        operation: CONSTANTS.LOGS_OPERATION.UNGROUP_ITEMS
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.UNGROUP_ITEMS_SUCCESSFULLY);
}

/**
 * add stock take items
 */
inventoryController.addStockTakeItems = async (payload) => {
    await SERVICES.stockTakeBufferService.create(payload);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL);
}

/**
 * list stock take items
 */
inventoryController.listStockTakeItems = async (payload) => {
    let pagination = {
        ...(payload.skip && { offset: payload.skip }),
        ...(payload.limit && { limit: payload.limit })
    }
    let data = await SERVICES.stockTakeBufferService.list({
        ...(payload.searchKey && { productID: { [Op.like]: `%${payload.searchKey}%` } }),
        ...(payload.stocktakeSerial && { stocktakeSerial: payload.stocktakeSerial })
    }, pagination);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL), { data });
}

/**
 * delete stock take items
 */
inventoryController.deleteStockTakeItems = async (payload) => {
    let data = await SERVICES.stockTakeBufferService.destroy({
        productID: payload.productID
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL);
}

/**
 * update stock take items
 */
inventoryController.updateStockTakeItems = async (payload) => {
    await SERVICES.stockTakeBufferService.update({ id: payload.id }, {
        ...(payload.qty && { qty: payload.qty }),
        ...(payload.description && { description: payload.description }),
        ...(payload.productID && { productID: payload.productID }),
        ...(payload.subLocation && { subLocation: payload.subLocation })
    });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL);
}

/**
 * check if product ID already exists
 */
inventoryController.checkProductId = async (payload) => {
    let data = await SERVICES.inventoryService.fetchById({ productID: payload.productID });
    if (!data) {
        data = await SERVICES.inventoryService.getGroupedItems({
            productID: { [Op.in]: [payload.productID] }
        })
        data = data.list[0];
    }
    if (data) {
        throw HELPERS.responseHelper.createErrorResponse(CONSTANTS.MESSAGES.PRODUCT_IDS_PRESENT_IN_INVENTORY, CONSTANTS.ERROR_TYPES.BAD_REQUEST)
    }
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PRODUCT_ID_AVAILABLE);
}

/**
 * approve/reject variance reports
 */
inventoryController.approveOrRejectVarianceReports = async (payload) => {
    await SERVICES.inventoryService.updateVarianceReport(
        { id: { [Op.in]: payload.ids } },
        {
            ...(payload.operation == VARIANCE_REPORT_STATUSES.REJECTED && { rejectionReason: payload.rejectionReason, status: VARIANCE_REPORT_STATUSES.REJECTED }),
            ...(payload.operation == VARIANCE_REPORT_STATUSES.APPROVED && { status: VARIANCE_REPORT_STATUSES.APPROVED })
        });
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL);
}

/************************************************* STOCK METHODS *************************************************/

/**
 * method to create new stock
 */
inventoryController.createStock = async payload => {
    // let checkIfAlreadyExists = await SERVICES.inventoryService.fetchStockTake({ locationCode: payload.locationCode, subLocation: payload.subLocation });
    // if (checkIfAlreadyExists) {
    //     let msg = CONSTANTS.MESSAGES.ONE_STOCK_TAKE_PER_LOCATION;
    //     msg = msg.replace("@location", payload.locationCode);
    //     throw HELPERS.responseHelper.createErrorResponse(msg, CONSTANTS.ERROR_TYPES.BAD_REQUEST);
    // }
    let data = await SERVICES.inventoryService.createStock(payload);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL), { data: data.serial });
}

/**
 * method to fetch stocktake
 */
inventoryController.fetchStocktake = async payload => {
    let data = await SERVICES.inventoryService.fetchStockTake({ serial: payload.serial });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL), { data });
}

/**
 * method to create new stock
 */
inventoryController.updateStocktake = async payload => {
    await SERVICES.inventoryService.updateStockTake(
        {
            serial: payload.serial
        },
        {
            ...(payload.year && { year: payload.year }),
            ...(payload.status && { status: payload.status })
        }
    );
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.OPERATION_SUCCESSFUL);
}

module.exports = inventoryController;
