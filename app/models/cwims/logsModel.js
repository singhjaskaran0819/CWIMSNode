'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let logs = connection.define("logs", {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        operation: { type: Sequelize.DataTypes.INTEGER },
        doneBy: { type: Sequelize.DataTypes.UUID },
        doneTo: { type: Sequelize.DataTypes.UUID },
        declarationId: { type: Sequelize.DataTypes.UUID },
        productCode: { type: Sequelize.DataTypes.STRING },

        // for errors
        module: { type: Sequelize.DataTypes.STRING },
        error: { type: Sequelize.DataTypes.TEXT },
        isError: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false }
    }, {
        timestamps: true
    });

    logs.associate = (models) => {
        // logs and users association
        models.user.hasMany(logs, { foreignKey: 'doneBy', sourceKey: 'id' });
        logs.belongsTo(models.user, { as: 'userDoneBy', foreignKey: 'doneBy', targetKey: 'id' });

        models.user.hasMany(logs, { foreignKey: 'doneTo', sourceKey: 'id' });
        logs.belongsTo(models.user, { as: 'userDoneTo', foreignKey: 'doneTo', targetKey: 'id' });
    }

    return logs;
};
