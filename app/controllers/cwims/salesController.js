"use strict";

const HELPERS = require("../../helpers");
const CONSTANTS = require('../../utils/constants');
const SERVICES = require('../../services');
const { Op } = require('sequelize');
const _ = require('lodash');
const utils = require('../../utils/utils');

/****************************
 ***** Sales controller *****
 ****************************/
let salesController = {};

/**
 * listing sales controller
 */
salesController.listSales = async (payload) => {
    let criteria = false, pagination = {
        limit: payload.limit,
        offset: payload.skip
    }
    criteria = {
        ...(payload.saleCurrency && { saleCurrency: payload.saleCurrency }),
        ...(payload.customerIdType && { customerIdType: payload.customerIdType }),
        ...(payload.countryOfResidency && { countryOfResidency: payload.countryOfResidency }),
        ...(payload.customerSaleType && { customerSaleType: payload.customerSaleType }),
        ...(payload.warehouseCode && { warehouseCode: payload.warehouseCode }),
        ...(payload.companyCode && { companyCode: payload.companyCode })
    }
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    let data = await SERVICES.salesService.listSales(criteria, false, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.SALES_LIST), { data });
}

/**
 * create new sale controller
 */
salesController.createNewSale = async (payload) => {
    await SERVICES.salesService.createNewSale(payload);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.SALE_CREATED);
}

/**
 * update sale controller
 */
salesController.updateSale = async (payload) => {
    await SERVICES.salesService.updateSale({ id: payload.id }, payload);
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.SALE_UPDATED);
}

/**
 * delete sale controller
 */
salesController.deleteSale = async (payload) => {
    return HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.SALE_DELETED);
}

/**
 * get drop down values
 */
salesController.getDropDownValues = async (payload) => {
    let data = await SERVICES.salesService.getDropDownValues();
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.DROP_DOWN_DATA_FETCHED), { data });
}

/**
 * get filters
 */
salesController.getFilters = async (payload) => {
    let data = await SERVICES.salesService.getFilters();
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.FILTERS_FETCHED), { data });
}

/**
 * search products
 */
salesController.searchProduct = async (payload) => {
    let data = await SERVICES.inventoryService.list({
        productID: { [Op.like]: `%${payload.keyword}%` }
    }, false, {}, false, ['productID', 'id', 'description', 'remainingQuantity', 'initialQuantity', 'customsValue']);
    data.list = data.list.map(item => {
        item = item.toJSON();
        item.totalCustomsValue = item.remainingQuantity * item.customsValue
        delete item.warehouselocation;
        return item;
    });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(CONSTANTS.MESSAGES.PRODUCTS_SEARCHED), { data });
}

module.exports = salesController;