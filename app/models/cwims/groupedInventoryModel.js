'use strict';

const { Sequelize } = require('sequelize');

module.exports = function(connection) {
    let groupedInventory = connection.define("groupedinventories", {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        productCode: { type: Sequelize.DataTypes.STRING },
        comboId: { type: Sequelize.DataTypes.UUID, defaultValue: Sequelize.DataTypes.UUIDV4 },
        productID: { type: Sequelize.DataTypes.STRING },
        description: { type: Sequelize.DataTypes.TEXT },
        qty: { type: Sequelize.DataTypes.INTEGER },
        locationCode: { type: Sequelize.DataTypes.STRING }
    }, {
        timestamps: true
    });

    return groupedInventory;
};