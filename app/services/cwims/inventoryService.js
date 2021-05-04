'use strict';

const _ = require('lodash');
const sequelize = require('sequelize');
const { Op } = sequelize;
const { INVENTORY_STATUSES, VARIANCE_REPORT_STATUSES, VARIANCE_REPORT_OPERATIONS, INVENTORY_ITEM_STATUSES } = require('../../utils/constants');
const { inventoryModel, warehouseLocationModel, warehouseModel, varianceReportModel, groupedInventoryModel, stockTakeModel, stockTakeBufferModel } = require('../../models');

let inventoryService = {};

/**
 * list inventory method
 */
inventoryService.list = async (criteria, nestedConditions = false, pagination = {}, filters = false, attributes = false, sort = {}, withJoin = true) => {
    let query = {
        ...(criteria && { where: { ...criteria, ...(filters && filters) } }),
        ...(pagination && pagination),
        ...(attributes ? { attributes } : {}),
        ...(withJoin && {
            include: [{
                model: warehouseLocationModel,
                ...(nestedConditions && { where: nestedConditions }),
                required: true,
                include: [{
                    model: warehouseModel,
                    required: true
                }]
            }]
        }),
        ...sort
    }
    let list = await inventoryModel.findAll(query);
    let totalCount = await inventoryModel.count({ ...(criteria && { where: { ...criteria, ...(filters && filters) } }) });
    return { list, ...(!nestedConditions ? { totalCount } : { totalCount: list.length }) }
}

/**
 * update inventory method
 */
inventoryService.updateInventory = async (criteria, dataToUpdate) => {
    return await inventoryModel.update(dataToUpdate, { where: criteria });
}

/**
 * list inventory method
 */
inventoryService.fetchById = async (criteria, attributes) => {
    return await inventoryModel.findOne({
        where: criteria,
        ...(attributes ? { attributes } : {}),
        include: [{
            model: warehouseLocationModel,
            include: [{
                model: warehouseModel
            }]
        }]
    });
}

/**
 * get Filters
 */
inventoryService.getFilters = async (groupedItemsFlag = false, varianceReports = false, stockTake = false) => {
    if (groupedItemsFlag) {
        let filtersData = await groupedInventoryModel.findAll({
            include: [
                {
                    model: warehouseLocationModel
                }
            ]
        });
        let locationData = filtersData.map(item => {
            return {
                name: item.warehouselocation.name,
                code: item.warehouselocation.code
            }
        })
        return { locationData: _.uniqBy(locationData, 'code') }
    } else if (stockTake) {
        let filtersData = await stockTakeModel.findAll({
            include: [
                {
                    model: warehouseLocationModel,
                    attributes: ['name', 'code']
                }
            ]
        });
        let locationData = filtersData.map(item => {
            return {
                name: item.warehouselocation.name,
                code: item.warehouselocation.code
            }
        })
        let yearData = filtersData.map(item => {
            return item.year
        })
        return { locationData: _.uniqBy(locationData, 'code'), yearData: _.uniq(yearData) }
    } else if (varianceReports) {
        let filtersData = await varianceReportModel.findAll({});
        let locationData = filtersData.map(item => {
            return item.locationCode
        })
        let statusData = filtersData.map(item => {
            return {
                status: _.invert(VARIANCE_REPORT_STATUSES)[item.status],
                statusCode: item.status
            }
        })
        return { locationData: _.uniq(locationData), statusData: _.uniqBy(statusData, "status") }
    } else {
        let filtersData = await inventoryModel.findAll({
            include: [
                {
                    model: warehouseLocationModel
                }
            ]
        });
        let yearData = filtersData.map(item => {
            return item.year
        })
        let serialData = filtersData.map(item => {
            return item.serial
        })
        let numberData = filtersData.map(item => {
            return item.number
        })
        let tariffCodeData = filtersData.map(item => {
            return item.tariffCode
        }).filter(element => {
            return element != undefined;
        })
        let locationCodeData = filtersData.map(item => {
            return {
                code: item.locationCode,
                name: item.warehouselocation.name
            }
        })
        return {
            yearData: _.uniq(yearData),
            locationCodeData: _.uniqBy(locationCodeData, 'code'),
            serialData: _.uniq(serialData),
            numberData: _.uniq(numberData),
            tariffCodeData: _.uniq(tariffCodeData)
        };
    }
}

/**
 * generate variance report
 */
inventoryService.generateVarianceReport = async (criteria) => {
    let products = await stockTakeBufferModel.findAll({ where: criteria });
    products = products.map(item => {
        item = item.toJSON();
        return {
            productID: item.productID,
            locationCode: item.locationCode,
            warehouseCode: item.warehouseCode,
            inventoryItemStatus: item.inventoryItemStatus,
            ...(item.subLocation && { subLocation: item.subLocation }),
            stockTakeQuantity: item.qty,
            stocktakeSerial: item.stocktakeSerial,
            description: item.description
        }
    })
    let inventoryData = await inventoryModel.findAll();
    let varianceReportData = products.map(item => {
        let product = _.find(inventoryData, { productID: item.productID });
        if (product) {
            product = product.toJSON()
            // need to remove productCode key because of request data key changes
            delete product.id;
            return {
                ...product,
                stockTakeQuantity: item.stockTakeQuantity,
                actualQuantity: product.remainingQuantity,
                warehouseCode: item.warehouseCode,
                stocktakeSerial: item.stocktakeSerial,
                ...(item.subLocation && { subLocation: item.subLocation }),
                inventoryItemStatus: item.inventoryItemStatus,
                ...{ description: item.description ? item.description : product.description },
                createdAt: new Date(),
                difference: (item.stockTakeQuantity - product.remainingQuantity) < 0 ? (item.stockTakeQuantity - product.remainingQuantity) * (-1) : (item.stockTakeQuantity - product.remainingQuantity)
            }
        } else {
            return {
                ...item,
                createdAt: new Date(),
                actualQuantity: item.stockTakeQuantity
            }
        }

    })
    varianceReportData = varianceReportData.filter(element => {
        return element !== undefined;
    });
    return await varianceReportModel.bulkCreate(varianceReportData);
}

/**
 * get variance reports
 */
inventoryService.getVarianceReports = async (criteria = false, attributes = false, pagination = {}, sort = {}) => {
    let list = await varianceReportModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        ...pagination,
        ...sort
    });
    return { list: list.rows, totalCount: list.count };
}

/**
 * update stock controller
 */
inventoryService.updateStock = async (products, operation) => {
    products = products.map(item => {
        return item.productID;
    })
    let inventory_data = await inventoryModel.findAll({
        where: {
            productID: {
                [Op.in]: products
            }
        }
    });
    let varianceReport_data = await varianceReportModel.findAll({
        where: {
            isUpdated: false,
            productID: {
                [Op.in]: products
            }
        }
    });
    let status;
    if (operation == VARIANCE_REPORT_OPERATIONS.ADD_QUANTITY || operation == VARIANCE_REPORT_OPERATIONS.REPLACE)
        status = VARIANCE_REPORT_STATUSES.UPDATED
    else
        status = VARIANCE_REPORT_STATUSES.CANCELLED

    varianceReport_data.forEach(item => {
        item.isUpdated = true;
        item.status = status;
        item.save();
    })
    let dataToUpdate = inventory_data.map(item => {
        let obj = _.find(varianceReport_data, { productID: item.productID });
        if (operation == VARIANCE_REPORT_OPERATIONS.ADD_QUANTITY) {
            item.initialQuantity = item.initialQuantity + obj.stockTakeQuantity;
            item.remainingQuantity = item.remainingQuantity + obj.stockTakeQuantity;
            return item;
        } else if (operation == VARIANCE_REPORT_OPERATIONS.REPLACE) {
            item.initialQuantity = obj.stockTakeQuantity;
            item.remainingQuantity = obj.stockTakeQuantity;
            return item;
        }
        return item;
    })
    dataToUpdate.forEach(item => {
        item.save();
    })
    return true;
}

/**
 * get all products that are remaining for updating
 */
inventoryService.getAllProducts = async (criteria, attributes = false) => {
    // get all the productIDs that are present in stock take buffer and variance reports with isUpdated=false
    let buffer_products = await stockTakeBufferModel.findAll();
    buffer_products = buffer_products.map(item => {
        item = item.toJSON();
        return item.productID;
    });
    let notUpdatedProducts = await varianceReportModel.findAll({
        where: {
            [Op.or]: [
                { status: VARIANCE_REPORT_STATUSES.CANCELLED },
                { status: VARIANCE_REPORT_STATUSES.REJECTED }
            ],
            isUpdated: false
        }
    });
    notUpdatedProducts = notUpdatedProducts.map(item => item.productID);
    // merge to single array
    let productsToExclude = [...notUpdatedProducts, ...buffer_products];
    let data = await inventoryModel.findAll({
        where: criteria,
        ...(attributes && { attributes })
    });
    data = data.filter(elem => {
        if (!productsToExclude.includes(elem.productID))
            return elem;
    })
    return data;
}

/**
 * group item service method
 */
inventoryService.groupItems = async (payload) => {
    let dataToSave = payload.products.map(item => {
        return {
            productCode: payload.productCode,
            description: payload.description,
            productID: item.productId,
            comboId: item.comboId,
            qty: item.quantity,
            locationCode: payload.locationCode
        }
    });
    return await groupedInventoryModel.bulkCreate(dataToSave);
}

/**
 * get grouped items
 */
inventoryService.fetchGroupedItemsForConditions = async (criteria = false, attributes = false) => {
    return await groupedInventoryModel.findAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        group: ['productID']
    })
}

// /**
//  * add new product to inventory
//  */
// inventoryService.updateNotFoundStock = async (varianceReportId, operation) => {
//     let reportData = await varianceReportModel.findOne({ where: { id: varianceReportId } });
//     let inv_obj = {
//         productID: reportData.productID,
//         // year: "",
//         // number: "",
//         // serial: "",
//         locationCode: "",
//         customsValue: reportData.customsValue,
//         // weight: "",
//         // supValue: "",
//         // tariffCode: "",
//         description: reportData.description,
//         initialQuantity: reportData.stockTakeQuantity,
//         remainingQuantity: reportData.stockTakeQuantity
//     }
//     await inventoryModel.create(inv_obj);
//     return true;
// }

/**
 * get grouped items
 */
inventoryService.getGroupedItems = async (criteria = false, nestedConditions = false, attributes = false, pagination, itemsData = false, sort = {}) => {
    if (!itemsData) {
        let query = {
            ...(criteria && { where: criteria }),
            attributes: {
                include: [[sequelize.literal('COUNT(DISTINCT(comboId))'), 'numberOfCombos']],
                exclude: ['qty', 'productID', 'comboId', 'locationCode', 'createdAt', 'updatedAt']
            },
            include: [{
                model: warehouseLocationModel,
                ...(nestedConditions && { where: nestedConditions }),
                required: true,
                attributes: ['name', 'code'],
                include: [{
                    model: warehouseModel,
                    attributes: ['name', 'code']
                }]
            }],
            ...pagination,
            group: ['productCode'],
            ...sort
        };
        let data = await groupedInventoryModel.findAndCountAll(query);
        return { list: data.rows, totalCount: data.count }
    } else {
        let info = await groupedInventoryModel.findOne({
            where: { productCode: criteria.productCode },
            include: [{
                model: inventoryModel,
                include: [{
                    model: warehouseLocationModel,
                    attributes: ['name', 'code']
                }]
            }],
            attributes: ['description', 'productCode', [sequelize.literal('COUNT(DISTINCT(comboId))'), 'numberOfCombos']],
        });

        if (!info) {
            return false;
        }

        let itemsArray = await groupedInventoryModel.findAll({
            where: criteria,
            group: ['productID'],
            include: [{
                model: inventoryModel,
                attributes: ['description', 'productID']
            }],
        });

        return {
            description: info.description,
            productCode: info.productCode,
            numberOfCombos: info.toJSON().numberOfCombos,
            locationCode: info.inventory.warehouselocation.code,
            items: itemsArray
        }
    }
}

/**
 * store data to inventory
 */
inventoryService.create = async (dataToSave) => {
    return await inventoryModel.bulkCreate(dataToSave);
}

/**
 * ungroup items
 */
inventoryService.destroy = async (criteria) => {
    return await groupedInventoryModel.destroy({ where: criteria });
}

/**
 * approve/reject variance reports
 */
inventoryService.updateVarianceReport = async (criteria, dataToUpdate) => {
    return await varianceReportModel.update(dataToUpdate, { where: criteria });
}

/**
 * create stock service method
 */
inventoryService.createStock = async (dataToSave) => {
    return await stockTakeModel.create(dataToSave);
}

/**
 * update stock service method
 */
inventoryService.updateStockTake = async (criteria, dataToUpdate) => {
    return await stockTakeModel.update(dataToUpdate, { where: criteria });
}

/**
 * fetch stock service method
 */
inventoryService.fetchStockTake = async (criteria, attributes = false) => {
    return await stockTakeModel.findOne({
        where: criteria,
        ...(attributes && { attributes }),
        include: [
            {
                model: warehouseLocationModel,
                attributes: ['code', 'name'],
                include: [
                    {
                        model: warehouseModel,
                        attributes: ['code', 'name']
                    }
                ]
            }
        ]

    });
}

/**
 * list stock service method
 */
inventoryService.listStockTake = async (criteria, attributes = false, pagination = {}, sort = {}) => {
    let data = await stockTakeModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        include: [
            {
                model: warehouseLocationModel,
                attributes: ['name', 'code']
            }
        ],
        ...pagination,
        ...sort
    });
    let varianceReportSerials = await inventoryService.getVarianceReports(false, ['stocktakeSerial']);
    varianceReportSerials = varianceReportSerials.list.map(res => res.toJSON().stocktakeSerial);
    varianceReportSerials = _.uniq(varianceReportSerials);
    data.rows = data.rows.map(res => {
        res = res.toJSON();
        if (varianceReportSerials.includes(res.serial))
            res.varianceReportAlreadyGenerated = true;
        else
            res.varianceReportAlreadyGenerated = false;
        return res;
    })
    return data;
}

module.exports = inventoryService;
