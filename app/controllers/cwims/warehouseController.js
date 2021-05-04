"use strict";

const CONFIG = require('../../../config');
const HELPERS = require("../../helpers");
const SERVICES = require('../../services');
const utils = require(`../../utils/utils`);
const { Op } = require("sequelize");
const _ = require("lodash");
const { MESSAGES, VARIANCE_REPORT_STATUSES, STOCK_TAKE_STATUSES } = require('../../utils/constants');
const warehouseLocationModel = require('../../models/cwims/warehouseLocationModel');

/********************************
 ***** warehouse controller *****
 ********************************/
let warehouseController = {};

/**
 * listing of warehouse controller method
 */
warehouseController.fetchList = async (payload) => {
    let criteria, pagination = {
        offset: payload.skip,
        limit: payload.limit
    };
    let sort = utils.createSortingObject(payload.sortKey, payload.sortDirection);
    if (payload.city || payload.country || payload.postalCode || payload.warehouseCode) {
        criteria = {
            ...(payload.city && { city: payload.city }),
            ...(payload.country && { country: payload.country }),
            ...(payload.postalCode && { postalCode: payload.postalCode }),
            ...(payload.warehouseCode && { code: payload.warehouseCode })
        }
    }
    let nestedConditions;
    if (payload.locationCode || payload.location_city || payload.location_country || payload.location_postalCode) {
        nestedConditions = {
            ...(payload.locationCode ? { code: payload.locationCode } : {}),
            ...(payload.location_postalCode ? { postalCode: payload.location_postalCode } : {}),
            ...(payload.location_city ? { city: payload.location_city } : {}),
            ...(payload.location_country ? { country: payload.location_country } : {})
        }
    }
    let attributes;
    if (payload.signupList) {
        attributes = ['name', 'code'];
    }
    let data = await SERVICES.warehouseService.fetchList(criteria, attributes, payload.signupList, nestedConditions, pagination, sort);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LIST), { ...(data ? { data } : { data: [] }) })
}

/**
 * listing of warehouse controller method
 */
warehouseController.fetchListOfCodeAndName = async (payload) => {
    let attributes = ['name', 'code'];
    let data = await SERVICES.warehouseService.fetchList({}, attributes, true);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LIST), { ...(data ? { data } : { data: [] }) })
}

/**
 * warehouse location filters controller 
 */
warehouseController.fetchWarehouseLocationFilters = async (payload) => {
    let data = await SERVICES.warehouseService.fetchWarehouseLocationFilters({ whs_code: payload.warehouseCode });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LOCATION_FILTERS), { data })
}

/**
 * fetch warehouse by code controller method
 */
warehouseController.fetchByCode = async (payload) => {
    let data, criteria, nestedFilters;
    if (payload.infinteScroll) {
        criteria = {
            whs_code: payload.code
        }
        let pagination = {
            offset: payload.skip,
            limit: payload.limit
        }
        data = await SERVICES.warehouseService.fetchWarehouseLocations(criteria, pagination);
    } else {
        criteria = {
            code: payload.code
        };
        if (payload.city || payload.country || payload.postalCode) {
            nestedFilters = {
                ...(payload.city && { city: payload.city }),
                ...(payload.country && { country: payload.country }),
                ...(payload.postalCode && { postalCode: payload.postalCode })
            }
        }
        data = await SERVICES.warehouseService.fetchWarehouse(criteria, nestedFilters, {});
    }

    if (payload.isStockTakeProcess) {
        let stockTakeData = await SERVICES.inventoryService.listStockTake({
            [Op.or]: [
                { status: STOCK_TAKE_STATUSES.OPENED },
                { status: STOCK_TAKE_STATUSES.PROVISIONALLY_CLOSED },
            ]
        });
        stockTakeData = stockTakeData.rows.map(item => item.locationCode);
        // filter location data
        data = data.warehouselocations;
        data = data.filter(elem => {
            elem = elem.toJSON();
            if (!stockTakeData.includes(elem.code))
                return elem;
        })
    }

    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_FETCH_BY_CODE), { data })
}

/**
 * fetch location by ID
 */
warehouseController.fetchLocationByCode = async (payload) => {
    let data = await SERVICES.warehouseService.fetchWarehouseLocationByCode({ code: payload.code });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_FETCH_BY_CODE), { data })
}

/**
 * get filters
 */
warehouseController.getFilters = async (payload) => {
    let criteria;
    if (payload.warehouseCode) {
        criteria = { whs_code: payload.warehouseCode }
    }
    let data = await SERVICES.warehouseService.getFilters(criteria);
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.FILTERS_FETCHED), { data })
}

/**
 * add warehouse 
 */
warehouseController.addWarehouse = async (payload) => {
    await SERVICES.warehouseService.addWarehouse(payload);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_ADDED);
}

/**
 * add warehouse locations
 */
warehouseController.addWarehouseLocation = async (payload) => {
    await SERVICES.warehouseService.addWarehouseLocation(payload);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LOCATION_ADDED);
}

/**
 * update warehouse 
 */
warehouseController.updateWarehouse = async (payload) => {
    await SERVICES.warehouseService.updateWarehouse({ code: payload.code }, payload);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_UPDATED);
}

/**
 * update warehouse location
 */
warehouseController.UpdateWarehouseLocation = async (payload) => {
    await SERVICES.warehouseService.updateWarehouseLocation({ code: payload.code }, payload);
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LOCATION_UPDATED);
}

/**
 * delete warehouse 
 */
warehouseController.deleteWarehouse = async (payload) => {
    await SERVICES.warehouseService.deleteWarehouse({ code: payload.code });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_DELETED);
}

/**
 * delete warehouse 
 */
warehouseController.deleteWarehouseLocation = async (payload) => {
    await SERVICES.warehouseService.deleteWarehouseLocation({ code: payload.code });
    return HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_LOCATION_DELETED);
}

/**
 * fetch sub locations 
 */
warehouseController.fetchSubLocations = async (payload) => {
    let data = await SERVICES.warehouseService.fetchSubLocations({ locationCode: payload.code });
    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.OPERATION_SUCCESSFUL), { data });
}

module.exports = warehouseController;