'use strict';

const { stockTakeBufferModel, inventoryModel, warehouseModel, warehouseLocationModel } = require('../../models');
const _ = require('lodash');

let stockTakeBufferService = {};

/**
 * add data
 */
stockTakeBufferService.create = async (dataToSave) => {
    return await stockTakeBufferModel.create(dataToSave);
}

/**
 * update data
 */
stockTakeBufferService.update = async (criteria, dataToUpdate) => {
    return await stockTakeBufferModel.update(dataToUpdate, { where: criteria });
}

/**
 * destroy data
 */
stockTakeBufferService.destroy = async (criteria) => {
    if (criteria)
        return await stockTakeBufferModel.destroy({ where: criteria });
    return await stockTakeBufferModel.destroy({ truncate: true });
}

/**
 * destroy data
 */
stockTakeBufferService.list = async (criteria = false, pagination = {}) => {
    let data = await stockTakeBufferModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...pagination
    });
    // data.rows = data.rows.map(item => {
    //     return {
    //         id: item.id,
    //         productID: item.productID,
    //         qty: item.qty,
    //         description: item.description,
    //         subLocation: item.subLocation,
    //         createdAt: item.createdAt,
    //         locationCode: item.locationCode
    //     }
    // })
    return data;
}

module.exports = stockTakeBufferService