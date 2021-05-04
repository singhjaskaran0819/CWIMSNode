'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    let declarationmessages = connection.define("declarationmessages", {
        id: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            primaryKey: true
        },
        reason: { type: Sequelize.DataTypes.TEXT },
        reply: { type: Sequelize.DataTypes.TEXT },
        declarationId: { type: Sequelize.DataTypes.UUID },
        operator: { type: Sequelize.DataTypes.UUID },
        officer: { type: Sequelize.DataTypes.UUID }
    }, {
        timestamps: true
    });

    return declarationmessages;
};
