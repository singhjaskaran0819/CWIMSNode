'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let warehouses = connection.define("warehouses", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        code: { type: Sequelize.DataTypes.STRING, allowNull: false, primaryKey: true },
        name: { type: Sequelize.DataTypes.STRING },
        email: { type: Sequelize.DataTypes.STRING },
        isPublic: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        addressLine1: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        street: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        city: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        country: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        postalCode: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        telephone: { type: Sequelize.DataTypes.STRING },
        startDate: { type: Sequelize.DataTypes.DATEONLY, defaultValue: new Date() },
        endDate: { type: Sequelize.DataTypes.DATEONLY },
    }, {
        timestamps: true
    });

    warehouses.associate = (models) => {
        warehouses.hasMany(models.warehouseLocation, { foreignKey: 'whs_code', sourceKey: 'code' });
        models.warehouseLocation.belongsTo(warehouses, { foreignKey: 'whs_code', targetKey: 'code' });

        warehouses.hasOne(models.user, { foreignKey: 'warehouseCode', sourceKey: 'code' });
        models.user.belongsTo(warehouses, { foreignKey: 'warehouseCode', targetKey: 'code' });
    }

    return warehouses;
};