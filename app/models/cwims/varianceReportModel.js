'use strict';

const { Sequelize } = require('sequelize');
const { VARIANCE_REPORT_STATUSES, INVENTORY_ITEM_STATUSES } = require('../../utils/constants');

module.exports = function (connection) {
    let varianceReports = connection.define("variancereports", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productID: { type: Sequelize.DataTypes.STRING },
        locationCode: { type: Sequelize.DataTypes.STRING },
        warehouseCode: { type: Sequelize.DataTypes.STRING },
        stocktakeSerial: { type: Sequelize.DataTypes.INTEGER },
        stockTakeQuantity: { type: Sequelize.DataTypes.DOUBLE },
        difference: { type: Sequelize.DataTypes.DOUBLE },
        status: { type: Sequelize.DataTypes.INTEGER, defaultValue: VARIANCE_REPORT_STATUSES.SUBMITTED },
        inventoryItemStatus: { type: Sequelize.DataTypes.INTEGER, defaultValue: INVENTORY_ITEM_STATUSES.EXISTS },
        rejectionReason: { type: Sequelize.DataTypes.TEXT },
        description: { type: Sequelize.DataTypes.TEXT },
        subLocation: { type: Sequelize.DataTypes.STRING },
        actualQuantity: { type: Sequelize.DataTypes.DOUBLE },
        isUpdated: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true
    });

    return varianceReports;
};