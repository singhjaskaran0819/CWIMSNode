'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let sadItems = connection.define("saditems", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lineNumber: { type: Sequelize.DataTypes.INTEGER },
        hsCode: { type: Sequelize.DataTypes.STRING },
        declarationId: { type: Sequelize.DataTypes.UUID },
        description: { type: Sequelize.DataTypes.TEXT },
        qty: { type: Sequelize.DataTypes.INTEGER },
        initialQuantity: { type: Sequelize.DataTypes.INTEGER },
        customsValue: { type: Sequelize.DataTypes.DOUBLE },
        itemTotalSupValue: { type: Sequelize.DataTypes.DOUBLE },
        weight: { type: Sequelize.DataTypes.DOUBLE },
        isLiquor: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        origin: { type: Sequelize.DataTypes.STRING },
        isRacked: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true
    });

    sadItems.associate = (models) => {
        sadItems.hasMany(models.rackItem, { foreignKey: 'sadItemId', sourceKey: 'id' });
        models.rackItem.belongsTo(sadItems, { foreignKey: 'sadItemId', targetKey: 'id' });
    }

    return sadItems;
};