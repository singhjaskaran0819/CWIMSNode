'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let varianceReports = connection.define("variancereports", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: { type: Sequelize.DataTypes.STRING },
        stockTakeQuantity: { type: Sequelize.DataTypes.DOUBLE },
        difference: { type: Sequelize.DataTypes.DOUBLE },
        isUpdated: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true
    });

    return varianceReports;
};
