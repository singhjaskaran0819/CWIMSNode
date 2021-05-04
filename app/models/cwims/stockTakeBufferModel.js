'use strict';

const { Sequelize } = require('sequelize');
const { INVENTORY_ITEM_STATUSES } = require('../../utils/constants');

module.exports = function (connection) {
    let stockTakeBuffer = connection.define("stocktakebuffer", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true
        },
        productID: { type: Sequelize.DataTypes.STRING },
        qty: { type: Sequelize.DataTypes.INTEGER },
        description: { type: Sequelize.DataTypes.TEXT },
        locationCode: { type: Sequelize.DataTypes.STRING },
        stocktakeSerial: { type: Sequelize.DataTypes.INTEGER }, // primary key from stock listing
        warehouseCode: { type: Sequelize.DataTypes.STRING },
        inventoryItemStatus: { type: Sequelize.DataTypes.INTEGER, defaultValue: INVENTORY_ITEM_STATUSES.EXISTS },
        subLocation: { type: Sequelize.DataTypes.STRING }
    }, {
        timestamps: true
    });

    stockTakeBuffer.associate = (models) => {
        models.stockTake.hasMany(stockTakeBuffer, { foreignKey: 'stocktakeSerial', sourceKey: 'serial' });
        stockTakeBuffer.belongsTo(models.stockTake, { foreignKey: 'stocktakeSerial', targetKey: 'serial' });
    }

    return stockTakeBuffer;
};
