'use strict';

const { Sequelize } = require('sequelize');
const CONSTANTS = require('../../utils/constants');

module.exports = function (connection) {
    let declarations = connection.define("declarations", {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        locationCode: { type: Sequelize.DataTypes.STRING },
        office: { type: Sequelize.DataTypes.STRING },
        year: { type: Sequelize.DataTypes.STRING },
        serial: { type: Sequelize.DataTypes.STRING },
        type: { type: Sequelize.DataTypes.STRING },
        number: { type: Sequelize.DataTypes.INTEGER },
        totalCustomsValue: { type: Sequelize.DataTypes.DOUBLE },
        totalSupValue: { type: Sequelize.DataTypes.DOUBLE },
        status: { type: Sequelize.DataTypes.INTEGER, defaultValue: CONSTANTS.DECLARATION_STATUS.PENDING },
        submittedBy: { type: Sequelize.DataTypes.UUID },
        isDeleted: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        isSadItemsRacked: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true
    });

    declarations.associate = (models) => {
        declarations.hasMany(models.sadItem, { foreignKey: 'declarationId', sourceKey: 'id' });
        models.sadItem.belongsTo(declarations, { foreignKey: 'declarationId', targetKey: 'id' });

        declarations.hasMany(models.declarationMessage, { foreignKey: 'declarationId', sourceKey: 'id' });
        models.declarationMessage.belongsTo(declarations, { foreignKey: 'declarationId', targetKey: 'id' });

        declarations.hasMany(models.logs, { foreignKey: 'declarationId', sourceKey: 'id' });
        models.logs.belongsTo(declarations, { foreignKey: 'declarationId', targetKey: 'id' });
    }

    return declarations;
};