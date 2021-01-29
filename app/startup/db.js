const { Sequelize } = require('sequelize');
const CONFIG = require('../../config');
const dbUtils = require('../utils/dbUtils');

const connection = new Sequelize(CONFIG.SQL.DB_NAME, CONFIG.SQL.USERNAME, CONFIG.SQL.PASSWORD, {
    host: CONFIG.SQL.HOST,
    dialect: "mysql",
    logging: false
});

/**
 * requiring models
 */
let models = {
    inventory: require("../models/cwims/inventoryModel")(connection),
    varianceReport: require("../models/cwims/varianceReportModel")(connection),
    warehouseLocation: require("../models/cwims/warehouseLocationModel")(connection),
    warehouse: require("../models/cwims/warehouseModel")(connection),
    user: require("../models/cwims/userModel")(connection),
    role: require("../models/cwims/roleModel")(connection),
    session: require("../models/cwims/sessionModel")(connection),
    groupedInventory: require("../models/cwims/groupedInventoryModel")(connection),
}

/**
 * association of all tables
 */
Object.keys(models).forEach(model => {
    if (models[model].associate) {
        models[model].associate(models)
    }
})

/**
 * connection authentication
 */
connection
    .authenticate()
    .then(() => {
        console.log(`'${CONFIG.SQL.DB_NAME}' database connected`);
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

/**
 * connection syncing
 */
connection
    .sync({
        alter: true,
        // force: true
    })
    .then(async () => {
        // add initial data
        await dbUtils.addInitialData(models);
        console.log('Tables created.');
    })
    .catch(err => {
        console.error("Unable to create tables", err);
    });

module.exports = connection;