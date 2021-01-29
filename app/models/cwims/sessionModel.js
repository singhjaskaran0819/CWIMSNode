'use strict';

const { Sequelize } = require('sequelize');

module.exports = function (connection) {
    var sessions = connection.define("sessions", {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        userId: { type: Sequelize.DataTypes.UUID, allowNull: false },
        accessToken: { type: Sequelize.DataTypes.TEXT, allowNull: false },
        role: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
    }, {
        timestamps: true
    });

    return sessions;
};