'use strict';

const { saleModel } = require('../../models');
const _ = require('lodash');
const CONSTANTS = require('../../utils/constants');
const salesModel = require('../../models/cwims/salesModel');

let salesService = {};

/**
 * listing sale
 */
salesService.listSales = async (criteria = false, attributes = false, pagination = {}, sort = {}) => {
    let data = await saleModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        ...pagination,
        ...sort
    });
    data.rows = data.rows.map(item => {
        item.saleCurrency = _.invert(CONSTANTS.CURRENCY)[item.saleCurrency];
        item.status = _.invert(CONSTANTS.SALES_STATUSES)[item.status];
        item.customerSaleType = _.invert(CONSTANTS.SALES_TYPE)[item.customerSaleType];
        item.customerIdType = _.invert(CONSTANTS.DOCUMENT_TYPES)[item.customerIdType];
        return item;
    })
    return data;
}

/**
 * add new sale
 */
salesService.createNewSale = async (dataToSave) => {
    return await saleModel.create(dataToSave);
}

/**
 * update sale
 */
salesService.updateSale = async (criteria, dataToUpdate) => {
    return await saleModel.update(dataToUpdate, { where: criteria });
}

/**
 * delete sale
 */
salesService.deleteSale = async (criteria) => {
    return await saleModel.destroy({ where: criteria });
}

/**
 * get drop down values
 */
salesService.getDropDownValues = async () => {
    let customerSaleTypeData = Object.keys(CONSTANTS.SALES_TYPE).map(item => {
        return {
            id: CONSTANTS.SALES_TYPE[`${item}`],
            customerSaleType: item
        }
    })
    let saleCurrencyData = Object.keys(CONSTANTS.CURRENCY).map(item => {
        return {
            id: CONSTANTS.CURRENCY[`${item}`],
            saleCurrency: item
        }
    })
    let customerIdTypeData = Object.keys(CONSTANTS.DOCUMENT_TYPES).map(item => {
        return {
            id: CONSTANTS.DOCUMENT_TYPES[`${item}`],
            customerIdType: item
        }
    })
    let departurePortsData = Object.keys(CONSTANTS.DEPARTURE_PORT).map(item => {
        return {
            id: CONSTANTS.DEPARTURE_PORT[`${item}`],
            depaturePort: item
        }
    })
    return { customerSaleTypeData, saleCurrencyData, customerIdTypeData, nationalitiesData: CONSTANTS.NATIONALITIES, departurePortsData };
}

/**
 * get filters
 */
salesService.getFilters = async () => {
    let salesRows = await saleModel.findAll();
    let customerIdTypeData = salesRows.map(item => {
        return {
            id: item.customerIdType,
            customerIdType: _.invert(CONSTANTS.DOCUMENT_TYPES)[item.customerIdType]
        }
    })
    let customerSaleTypeData = salesRows.map(item => {
        return {
            id: item.customerSaleType,
            saleType: _.invert(CONSTANTS.SALES_TYPE)[item.customerSaleType]
        }
    })
    let saleCurrencyData = salesRows.map(item => {
        return {
            id: item.saleCurrency,
            saleCurrency: _.invert(CONSTANTS.CURRENCY)[item.saleCurrency]
        }
    })
    let countryOfResidencyData = salesRows.map(item => {
        return item.countryOfResidency
    })
    return {
        customerIdTypeData: _.uniqBy(customerIdTypeData, 'id'),
        customerSaleTypeData: _.uniqBy(customerSaleTypeData, 'id'),
        saleCurrencyData: _.uniqBy(saleCurrencyData, 'id'),
        countryOfResidencyData: _.uniq(countryOfResidencyData),
    };
}

module.exports = salesService;