'use strict';

const { Sequelize } = require('sequelize');
const CONSTANTS = require('../../utils/constants');

module.exports = function (connection) {
    let sales = connection.define("sales", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        isDraft: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        receiptNumber: { type: Sequelize.DataTypes.STRING },
        receiptDate: { type: Sequelize.DataTypes.DATEONLY, defaultValue: new Date() },
        warehouseCode: { type: Sequelize.DataTypes.STRING },
        companyCode: { type: Sequelize.DataTypes.STRING },
        customerSaleType: { type: Sequelize.DataTypes.INTEGER }, // enum
        saleCurrency: { type: Sequelize.DataTypes.INTEGER }, // enum
        saleValue: { type: Sequelize.DataTypes.DOUBLE },
        status: { type: Sequelize.DataTypes.INTEGER, defaultValue: CONSTANTS.SALES_STATUSES.Pending },

        // customer details
        customerName: { type: Sequelize.DataTypes.STRING },
        customerAddress: { type: Sequelize.DataTypes.TEXT },
        customerIdType: { type: Sequelize.DataTypes.INTEGER },
        customerIdNumber: { type: Sequelize.DataTypes.STRING },
        customerIdCtyIssue: { type: Sequelize.DataTypes.STRING },
        customerNationality: { type: Sequelize.DataTypes.STRING },
        countryOfResidency: { type: Sequelize.DataTypes.STRING },

        // transport details
        customerTransportId: { type: Sequelize.DataTypes.STRING },
        vesselName: { type: Sequelize.DataTypes.STRING },
        departure: { type: Sequelize.DataTypes.DATEONLY, defaultValue: new Date() },
        portDeparture: { type: Sequelize.DataTypes.STRING },
        ticketNumber: { type: Sequelize.DataTypes.STRING },
        customerTransportType: { type: Sequelize.DataTypes.STRING }
    }, {
        timestamps: true
    });

    sales.associate = (models) => {
        sales.hasMany(models.saleProducts, { foreignKey: 'saleID', sourceKey: 'id' });
        models.saleProducts.belongsTo(sales, { foreignKey: 'saleID', targetKey: 'id' });
    }

    return sales;
};
