'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let inventory = connection.define("inventories", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        productID: { type: Sequelize.DataTypes.STRING, primaryKey: true },
        year: { type: Sequelize.DataTypes.STRING },
        number: { type: Sequelize.DataTypes.INTEGER },
        serial: { type: Sequelize.DataTypes.STRING },
        locationCode: { type: Sequelize.DataTypes.STRING },
        customsValue: { type: Sequelize.DataTypes.DOUBLE },
        unitValue: { type: Sequelize.DataTypes.DOUBLE },
        weight: { type: Sequelize.DataTypes.DOUBLE },
        supValue: { type: Sequelize.DataTypes.DOUBLE },
        tariffCode: { type: Sequelize.DataTypes.STRING },
        description: { type: Sequelize.DataTypes.TEXT },
        initialQuantity: { type: Sequelize.DataTypes.INTEGER },
        remainingQuantity: { type: Sequelize.DataTypes.INTEGER }
    }, {
        timestamps: true
    });

    inventory.associate = (models) => {
        // inventory.hasMany(models.varianceReport, { foreignKey: 'productID', sourceKey: 'productID' });
        // models.varianceReport.belongsTo(inventory, { foreignKey: 'productID', targetKey: 'productID' });

        inventory.hasMany(models.groupedInventory, { foreignKey: 'productID', sourceKey: 'productID' });
        models.groupedInventory.belongsTo(inventory, { foreignKey: 'productID', targetKey: 'productID' });

        inventory.hasMany(models.saleProducts, { foreignKey: 'productID', sourceKey: 'productID' });
        models.saleProducts.belongsTo(inventory, { foreignKey: 'productID', targetKey: 'productID' });

        // inventory.hasMany(models.stockTakeBuffer, { foreignKey: 'productID', sourceKey: 'productID'  });
        // models.stockTakeBuffer.belongsTo(inventory, { foreignKey: 'productID', targetKey: 'productID' });
    }

    return inventory;
};
