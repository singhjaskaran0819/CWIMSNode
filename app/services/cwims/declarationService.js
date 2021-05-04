'use strict';

const { declarationModel, warehouseLocationModel, warehouseModel, sadItemModel, userModel, rackItemModel, declarationMessageModel } = require('../../models');
const { DECLARATION_STATUS } = require('../../utils/constants');
const _ = require('lodash');
const { Op } = require('sequelize');

let declarationService = {};

/**
 * add decalaration
 */
declarationService.addDeclaration = async (declaration_data) => {
    let sadItems = declaration_data.stock.receiptItems;
    let declaration = await declarationModel.create({
        locationCode: declaration_data.stock.locationCode,
        office: declaration_data.office,
        year: declaration_data.year,
        serial: declaration_data.serial,
        type: declaration_data.type,
        number: declaration_data.number,
        totalCustomsValue: declaration_data.stock.totalCustomsValue
    });
    sadItems = sadItems.map(item => {
        item.declarationId = declaration.id;
        item.initialQuantity = item.qty;
        return item;
    })
    await sadItemModel.bulkCreate(sadItems);
    return { declaration: declaration.id };
}

/**
 * function to fetch received goods.
 */
declarationService.fetchGoodsReceived = async (criteria = false, attributes = false, operator_whs_condition = false, pagination, sort = {}) => {
    return await declarationModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        include: [
            {
                model: warehouseLocationModel,
                attributes: ['code', 'name', 'id', 'email'],
                ...(operator_whs_condition && { where: operator_whs_condition }),
                include: [
                    {
                        model: warehouseModel,
                        attributes: ['code', 'name', 'email', 'id']
                    }
                ]
            }
        ],
        ...pagination,
        ...sort
    });
};

/**
 * fetch declation by Id
 */
declarationService.fetchDeclarationById = async (criteria, attributes = false) => {
    return await declarationModel.findOne({
        where: criteria,
        include: [
            {
                model: warehouseLocationModel,
                attributes: ['code', 'name', 'id', 'email'],
                include: [
                    {
                        model: warehouseModel,
                        attributes: ['code', 'name', 'email', 'id']
                    }
                ]
            }
        ],
    })
}

/**
 * get filters
 */
declarationService.getFilters = async () => {
    let data = await declarationModel.findAll({
        include: [
            {
                model: warehouseLocationModel,
                attributes: ['code', 'name', 'id', 'email'],
                include: [
                    {
                        model: warehouseModel,
                        attributes: ['code', 'name', 'email', 'id']
                    }
                ]
            }
        ]
    });
    let statusData = data.map(item => {
        return {
            statusCode: item.status,
            statusTitle: _.invert(DECLARATION_STATUS)[item.status].toLowerCase()
        }
    })
    let locationData = data.map(item => {
        return {
            code: item.warehouselocation.code,
            name: item.warehouselocation.name
        }
    })
    let yearData = data.map(item => {
        return item.year
    })
    let serialData = data.map(item => {
        return item.serial
    })
    let numberData = data.map(item => {
        return item.number
    })
    return {
        statusData: _.uniqBy(statusData, 'statusCode'),
        locationData: _.uniqBy(locationData, 'code'),
        yearData: _.uniq(yearData),
        serialData: _.uniq(serialData),
        numberData: _.uniq(numberData),
    }
};

/**
 * function to fetch SAD items.
 */
declarationService.fetchSADItems = async (criteria = false, attributes = false, pagination, sort = {}) => {
    return await sadItemModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        ...(attributes && { attributes }),
        ...pagination,
        ...sort
    });
};

/**
 * update SAD items
 */
declarationService.updateSADItems = async (criteria, dataToUpdate) => {
    return await sadItemModel.update(dataToUpdate, { where: criteria })
};


/**
 * rack Items
 */
declarationService.rackItems = async (items, sadItemId) => {
    // set quantity zero as per logic on frontend (Rack until becoming zero)
    await rackItemModel.bulkCreate(items);
    await sadItemModel.update({ qty: 0, isRacked: true }, { where: { id: sadItemId } });

    // making isSadItemsRacked to true if all items are racked
    let sadItemData = await sadItemModel.findOne({ where: { id: sadItemId } });
    let checkIfNotRackedYet = await sadItemModel.findOne({ where: { declarationId: sadItemData.declarationId, isRacked: false } })
    if (!checkIfNotRackedYet) {
        await declarationModel.update({ isSadItemsRacked: true }, { where: { id: sadItemData.declarationId } });
    }
    return true;
}

/**
 * fetch SAD item by ID
 */
declarationService.fetchSADItemByID = async (criteria) => {
    return await sadItemModel.findOne({ where: criteria });
}

/**
        "cr
 * fetch rack Items
 */
declarationService.fetchRackItems = async (criteria = false, attributes = false, pagination = {}, sort) => {
    let data = await rackItemModel.findAndCountAll({
        ...(criteria && { where: criteria }),
        include: [
            {
                model: sadItemModel,
                attributes: ['hsCode', 'lineNumber']
            }
        ],
        ...(attributes && { attributes }),
        ...pagination,
        ...sort
    });
    data.rows = data.rows.map(item => {
        return {
            id: item.id,
            productID: item.productID,
            description: item.description,
            qty: item.qty,
            subLocation: item.subLocation,
            customsValue: item.customsValue,
            supplementryValue: item.supplementryValue,
            weight: item.weight,
            createdAt: item.createdAt,
            hsCode: item.saditem.hsCode,
            lineNumber: item.saditem.lineNumber
        };
    })
    return data;
}

/**
 * upload data via CSV/XLSX
 */
declarationService.uploadRackItems = async (dataToSave) => {
    return await rackItemModel.bulkCreate(dataToSave, { ignoreDuplicates: true });
}

/**
 * update declaration
 */
declarationService.updateDeclaration = async (criteria, dataToUpdate) => {
    return await declarationModel.update(dataToUpdate, { where: criteria });
}

/**
 * create declaration messages model
 */
declarationService.createDeclarationMessageModel = async (dataToSave) => {
    return await declarationMessageModel.create(dataToSave);
}

/**
 * update declaration messages model
 */
declarationService.updateDeclarationMessageModel = async (criteria, dataToUpdate) => {
    return await declarationMessageModel.update(dataToUpdate, { where: criteria });
}

/**
 * update racked items
 */
declarationService.updateRackedItems = async (criteria, dataToUpdate) => {
    await rackItemModel.update(dataToUpdate, { where: criteria });
    let rackedItemData = await rackItemModel.findOne({
        where: criteria,
        include: [
            {
                model: sadItemModel
            }
        ]
    });
    let rackedItemsData = await rackItemModel.findAll({ where: { sadItemId: rackedItemData.saditem.id } });
    let sadItemData = await sadItemModel.findOne({ where: { id: rackedItemData.saditem.id } });
    let newQuantity = 0;
    let totalRackedCustomValue = 0;
    rackedItemsData.forEach(item => {
        newQuantity = item.quantity + newQuantity;
        totalRackedCustomValue = totalRackedCustomValue + item.customValue;
    });
    dataToUpdate = {
        quantity: (sadItemData.initialQuantity - newQuantity),
        ...((sadItemData.initialQuantity - newQuantity) > 0 ? { isRacked: false } : { isRacked: true }),
        remainingCustomValue: sadItemData.value - totalRackedCustomValue
    }
    await sadItemModel.update(dataToUpdate, { where: { id: rackedItemData.saditem.id } });
    return true;
}

/**
 * reset racked items
 */
declarationService.resetRackedItems = async (criteria) => {
    // clear racked items 
    await rackItemModel.destroy({ where: { sadItemId: criteria.id } });
    let data = await sadItemModel.findOne({ where: criteria });

    // reset quantity 
    await sadItemModel.update({ qty: data.initialQuantity, isRacked: false }, { where: criteria });
    
    // set declaration boolean key
    // making isSadItemsRacked to false if all items are un-racked
    let sadItemData = await sadItemModel.findOne({ where: { id: criteria.id } });
    let checkIfNotRackedYet = await sadItemModel.findOne({ where: { declarationId: sadItemData.declarationId, isRacked: true } })
    if (!checkIfNotRackedYet) {
        await declarationModel.update({ isSadItemsRacked: false }, { where: { id: sadItemData.declarationId } });
    }
    return true
}

/**
 * reset racked items
 */
declarationService.resetRackedItemsByDeclaration = async (criteria) => {
    // fetch all sad items 
    let sadItems = await sadItemModel.findAll({ where: criteria, attributes: ['id', 'initialQuantity', 'qty'] });
    await rackItemModel.destroy({ where: { sadItemId: { [Op.in]: sadItems.map(item => item.id) } } });
    // reset sadItems 
    sadItems.forEach(item => {
        item.qty = item.initialQuantity;
        item.isRacked = false;
        item.save()
    });
    await declarationModel.update({ isSadItemsRacked: false }, { where: { id: criteria.declarationId } })
    return true;
}

/**
 * get messages
 */
declarationService.getMessages = async (criteria = false, attributes = false, pagination) => {
    return await declarationMessageModel.findAndCountAll({
        where: criteria,
        include: [
            {
                model: userModel,
                attributes: ['id', 'email', 'firstName', 'lastName'],
                as: 'officerData'
            },
            {
                model: userModel,
                attributes: ['id', 'email', 'firstName', 'lastName'],
                as: 'operatorData'
            }
        ],
        ...(attributes && { attributes }),
        ...pagination
    });
}

/**
* fetch racked Items for storing to inventories
*/
declarationService.fetchRackedItemsForPassingForward = async (criteria) => {
    return await rackItemModel.findAll({
        include: [
            {
                model: sadItemModel,
                where: criteria,
                include: [
                    {
                        model: declarationModel
                    }
                ]
            }
        ],
    });
}

/**
 * delete declaration
 */
declarationService.deleteDeclaration = async (criteria) => {
    // deleting declaration
    await declarationModel.update({ isDeleted: true }, { where: criteria });
    // deleting sadItems 
    await sadItemModel.destroy({ where: { declarationId: criteria.id } });
    return true;
}

module.exports = declarationService;