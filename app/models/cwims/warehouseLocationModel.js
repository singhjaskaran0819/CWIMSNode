'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    var warehouseLocations = connection.define("warehouselocations", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        whs_code: { type: Sequelize.DataTypes.STRING },
        code: { type: Sequelize.DataTypes.STRING, primaryKey: true },
        name: { type: Sequelize.DataTypes.STRING },
        isPublic: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        addressLine1: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        street: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        city: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        country: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        postalCode: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        telephone: { type: Sequelize.DataTypes.STRING },
        startDate: { type: Sequelize.DataTypes.DATEONLY }
    }, {
        timestamps: true
    });

    warehouseLocations.associate = (models) => {
        warehouseLocations.hasMany(models.inventory, { foreignKey: 'locationCode', sourceKey: 'code' });
        models.inventory.belongsTo(warehouseLocations, { foreignKey: 'locationCode', targetKey: 'code' });

        warehouseLocations.hasMany(models.groupedInventory, { foreignKey: 'locationCode', sourceKey: 'code' });
        models.groupedInventory.belongsTo(warehouseLocations, { foreignKey: 'locationCode', targetKey: 'code' });
    }

    return warehouseLocations;
};