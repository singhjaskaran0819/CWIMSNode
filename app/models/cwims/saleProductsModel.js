'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let saleProducts = connection.define("saleproducts", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        saleID: { type: Sequelize.DataTypes.INTEGER },
        productID: { type: Sequelize.DataTypes.STRING },
        description: { type: Sequelize.DataTypes.TEXT },
        qty: { type: Sequelize.DataTypes.INTEGER },
        saleValue: { type: Sequelize.DataTypes.DOUBLE }
    }, {
        timestamps: true
    });

    return saleProducts;
};