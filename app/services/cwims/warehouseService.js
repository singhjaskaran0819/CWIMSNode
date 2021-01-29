'use strict';

const _ = require('lodash');
const { warehouseModel, warehouseLocationModel } = require("../../models");

let warehouseService = {};

/**
 * fetching list of all warehouses
 */
warehouseService.fetchList = async (criteria, attributes, signupList = false, nestedConditions = false, pagination = {}) => {
    let query = {
        ...(criteria && { where: criteria }),
        ...pagination,
        ...(attributes ? { attributes } : {}),
        ...(!signupList ? {
            include: [
                {
                    model: warehouseLocationModel,
                    ...(nestedConditions && { where: nestedConditions })
                }
            ]
        } : {})
    };
    let list = await warehouseModel.findAll(query);
    let totalCount = await warehouseModel.count({ ...(criteria && { where: criteria }) });
    if (signupList) {
        return list
    }
    return { list, totalCount }
}

/**
 * fetch warehouse details
 */
warehouseService.fetchWarehouse = async (criteria, nestedFilters = false, attributes) => {
    return await warehouseModel.findOne({
        where: criteria,
        ...(attributes ? { attributes } : {}),
        include: [
            {
                model: warehouseLocationModel,
                ...(nestedFilters && { where: nestedFilters })
            }
        ]
    });
}

/**
 * fetch warehouse location for infinite scrolling in panel
 */
warehouseService.fetchWarehouseLocations = async (criteria) => {
    return await warehouseLocationModel.findAndCountAll(criteria);
}

/**
 * warehouse  
 */
warehouseService.fetchWarehouseLocationFilters = async (criteria) => {
    let filtersData = await warehouseLocationModel.findAll({ where: criteria });
    let warehouseLocationData = filtersData.map(item => {
        return { code: item.code, name: item.name }
    })
    let cityData = filtersData.map(item => {
        return { city: item.city }
    })
    let countryData = filtersData.map(item => {
        return { country: item.country }
    })
    let postalCodeData = filtersData.map(item => {
        return { postalCode: item.postalCode }
    })
    return { warehouseLocationData, cityData: _.uniqBy(cityData, 'city'), countryData: _.uniqBy(countryData, 'country'), postalCodeData: _.uniqBy(postalCodeData, 'postalCode') };
}

/**
 * get Filters
 */
warehouseService.getFilters = async (criteria) => {
    let warehouses = await warehouseModel.findAll({});
    let warehouseLocationData = await warehouseLocationModel.findAll({
        ...(criteria && { where: criteria }),
        attributes: ['code', 'name']
    })
    let warehouseData = warehouses.map(item => {
        return { name: item.name, code: item.code }
    })
    let cityData = warehouses.map(item => {
        return { city: item.city }
    })
    let countryData = warehouses.map(item => {
        return { country: item.country }
    })
    let postalCodeData = warehouses.map(item => {
        return { postalCode: item.postalCode }
    })

    return { warehouseData, warehouseLocationData, cityData: _.uniqBy(cityData, 'city'), countryData: _.uniqBy(countryData, 'country'), postalCodeData: _.uniqBy(postalCodeData, 'postalCode') };
}

/**
 * fetch warehouse locations
 */
warehouseService.fetchWarehouseLocationyCode = async (criteria, attributes) => {
    return warehouseLocationModel.findOne({
        where: criteria
    });
}

module.exports = warehouseService;