'use strict';

const _ = require('lodash');
const { warehouseModel, warehouseLocationModel, userModel, inventoryModel } = require("../../models");

let warehouseService = {};

/**
 * add warehouse
 */
warehouseService.addWarehouse = async (dataToSave) => {
    return await warehouseModel.create(dataToSave);
}

/**
 * add warehouse location
 */
warehouseService.addWarehouseLocation = async (dataToSave) => {
    return await warehouseLocationModel.create(dataToSave);
}

/**
 * update warehouse
 */
warehouseService.updateWarehouse = async (criteria, dataToUpdate) => {
    return await warehouseModel.update(dataToUpdate, { where: criteria });
}

/**
 * update warehouse location
 */
warehouseService.updateWarehouseLocation = async (criteria, dataToUpdate) => {
    return await warehouseLocationModel.update(dataToUpdate, { where: criteria });
}

/**
 * delete warehouse
 */
warehouseService.deleteWarehouse = async (criteria) => {
    return await warehouseModel.destroy({ where: criteria });
}

/**
 * delete warehouse location
 */
warehouseService.deleteWarehouseLocation = async (criteria) => {
    return await warehouseLocationModel.destroy({ where: criteria });
}

/**
 * fetch sub locations
 */
warehouseService.fetchSubLocations = async (criteria) => {
    let data = await inventoryModel.findAll({
        where: criteria,
        attributes: ['subLocation'],
        order: [['subLocation', 'ASC']]
    });
    data = data.map(item => {
        return item.subLocation;
    }).filter(elem => {
        if (elem != undefined || elem != null)
            return elem;
    })
    return { subLocations: _.uniq(data) }
}

/**
 * fetching list of all warehouses
 */
warehouseService.fetchList = async (criteria, attributes, signupList = false, nestedConditions = false, pagination = {}, sort = {}) => {
    let query = {
        ...(criteria && { where: criteria }),
        ...pagination,
        ...(attributes ? { attributes } : {}),
        ...sort,
        ...(!signupList ? {
            include: [
                {
                    model: warehouseLocationModel,
                    ...(nestedConditions && { where: nestedConditions })
                },
                {
                    model: userModel,
                    attributes: ['firstName', 'lastName', 'phoneNumber', 'email']
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
                ...(nestedFilters && { where: nestedFilters }),
                include: [
                    {
                        model: userModel,
                        attributes: ['firstName', 'lastName', 'email', 'phoneNumber'],
                        as: 'contactPersonData'
                    }
                ]
            },
            {
                model: userModel,
                attributes: ['firstName', 'lastName', 'email', 'phoneNumber']
            }
        ]
    });
}

/**
 * fetch warehouse location for infinite scrolling in panel
 */
warehouseService.fetchWarehouseLocations = async (criteria, pagination) => {
    return await warehouseLocationModel.findAndCountAll({
        where: criteria,
        include: [
            {
                model: userModel,
                as: 'contactPersonData',
                attributes: ['firstName', 'lastName', 'email', 'phoneNumber']
            }
        ],
        ...pagination
    });
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
    return {
        warehouseLocationData,
        cityData: _.uniqBy(cityData, 'city'),
        countryData: _.uniqBy(countryData, 'country'),
        postalCodeData: _.uniqBy(postalCodeData, 'postalCode')
    };
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

    return {
        warehouseData,
        warehouseLocationData,
        cityData: _.uniqBy(cityData, 'city'),
        countryData: _.uniqBy(countryData, 'country'),
        postalCodeData: _.uniqBy(postalCodeData, 'postalCode')
    };
}

/**
 * fetch warehouse locations
 */
warehouseService.fetchWarehouseLocationByCode = async (criteria, attributes) => {
    return warehouseLocationModel.findOne({
        where: criteria,
        include: [
            {
                model: userModel,
                attributes: ['firstName', 'lastName', 'email', 'phoneNumber'],
                as: 'contactPersonData'
            }
        ]
    });
}

module.exports = warehouseService;