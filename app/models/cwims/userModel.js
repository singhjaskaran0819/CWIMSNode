'use strict';

const { Sequelize } = require('sequelize');
const commonFunctions = require('../../utils/utils');
const CONSTANTS = require('../../utils/constants');

module.exports = function (connection) {
    let users = connection.define("users", {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.DataTypes.UUIDV4
        },
        email: { type: Sequelize.DataTypes.STRING },
        role: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
        isSuspended: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        firstName: { type: Sequelize.DataTypes.STRING, allowNull: false },
        lastName: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        phoneNumber: { type: Sequelize.DataTypes.STRING },
        addressLine1: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        street: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        city: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        country: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        postalCode: { type: Sequelize.DataTypes.STRING, defaultValue: "" },
        warehouseCode: { type: Sequelize.DataTypes.STRING },
        profilePicture: { type: Sequelize.DataTypes.STRING(500) },
        otp: { type: Sequelize.DataTypes.TEXT },
        resetPasswordToken: { type: Sequelize.DataTypes.TEXT },
        password: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('password', commonFunctions.hashPassword(value));
            }
        },
        lastPasswordUpdated: { type: Sequelize.DataTypes.DATE },
        unsuccessfulLogins: { type: Sequelize.DataTypes.INTEGER, defaultValue: 0 },
        isBlocked: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        isAccountVerified: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        status: { type: Sequelize.DataTypes.INTEGER, defaultValue: CONSTANTS.USER_STATUS.Pending },
        rejectionReason: { type: Sequelize.DataTypes.TEXT }
    }, {
        timestamps: true
    });

    return users;
};