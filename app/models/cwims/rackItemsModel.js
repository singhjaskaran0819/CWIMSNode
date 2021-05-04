'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let rackItems = connection.define("rackitems", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sadItemId: { type: Sequelize.DataTypes.INTEGER },
        productID: { type: Sequelize.DataTypes.STRING },
        description: { type: Sequelize.DataTypes.TEXT },
        qty: { type: Sequelize.DataTypes.INTEGER },
        customsValue: { type: Sequelize.DataTypes.DOUBLE },
        supplementryValue: { type: Sequelize.DataTypes.DOUBLE },
        weight: { type: Sequelize.DataTypes.DOUBLE }
    }, {
        timestamps: true
    });

    return rackItems;
};