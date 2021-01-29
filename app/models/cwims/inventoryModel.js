'use strict';

const { Sequelize } = require('sequelize');
const CONSTANTS = require('../../utils/constants');

module.exports = function (connection) {
    let inventory = connection.define("inventories", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        productId: { type: Sequelize.DataTypes.STRING, primaryKey: true },
        name: { type: Sequelize.DataTypes.STRING },
        year: { type: Sequelize.DataTypes.STRING },
        number: { type: Sequelize.DataTypes.INTEGER },
        serial: { type: Sequelize.DataTypes.STRING },
        locationCode: { type: Sequelize.DataTypes.STRING },
        status: { type: Sequelize.DataTypes.INTEGER },
        customValue: { type: Sequelize.DataTypes.DOUBLE },
        tariffCode: { type: Sequelize.DataTypes.STRING },
        description: { type: Sequelize.DataTypes.TEXT },
        initialQuantity: { type: Sequelize.DataTypes.INTEGER },
        remainingQuantity: { type: Sequelize.DataTypes.INTEGER }
    }, {
        timestamps: true
    });

    inventory.associate = (models) => {
        inventory.hasMany(models.varianceReport, { foreignKey: 'productId', sourceKey: 'productId' });
        models.varianceReport.belongsTo(inventory, { foreignKey: 'productId', targetKey: 'productId' });

        inventory.hasOne(models.groupedInventory, { foreignKey: 'productId', sourceKey: 'productId' });
        models.groupedInventory.belongsTo(inventory, { foreignKey: 'productId', targetKey: 'productId' });
    }

    return inventory;
};
