"use strict";

const CONFIG = require('../../../config');
const HELPERS = require("../../helpers");
const SERVICES = require('../../services');
const utils = require(`../../utils/utils`);
const { Op } = require("sequelize");
const { MESSAGES } = require('../../utils/constants');
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
    let data = await SERVICES.warehouseService.fetchList(criteria, attributes, payload.signupList, nestedConditions, pagination);
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
            where: {
                whs_code: payload.code
            },
            offset: payload.skip,
            limit: payload.limit
        }
        data = await SERVICES.warehouseService.fetchWarehouseLocations(criteria);
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

    return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.WAREHOUSE_FETCH_BY_CODE), { data })
}

/**
 * 
 */
warehouseController.fetchLocationByCode = async (payload) => {
    let data = await SERVICES.warehouseService.fetchWarehouseLocationyCode({ code: payload.code });
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

module.exports = warehouseController;