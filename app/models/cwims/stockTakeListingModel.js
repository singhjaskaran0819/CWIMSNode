'use strict';

const { Sequelize } = require('sequelize');
const { STOCK_TAKE_STATUSES } = require('../../utils/constants');

module.exports = function (connection) {
    let stockTake = connection.define("stocktakes", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        serial: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        year: { type: Sequelize.DataTypes.STRING, defaultValue: new Date().getFullYear().toString() },
        status: { type: Sequelize.DataTypes.INTEGER, defaultValue: STOCK_TAKE_STATUSES.OPENED },
        locationCode: { type: Sequelize.DataTypes.STRING },
        subLocation: { type: Sequelize.DataTypes.STRING }
    }, {
        timestamps: true
    });

    stockTake.associate = (models) => {
        models.warehouseLocation.hasOne(stockTake, { foreignKey: 'locationCode', sourceKey: 'code' });
        stockTake.belongsTo(models.warehouseLocation, { foreignKey: 'locationCode', targetKey: 'code' });
    }

    return stockTake;
};