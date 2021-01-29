'use strict';

const MODELS = require('../startup/db').models;
/********************************
 **** Managing all the models ***
 ********* independently ********
 ********************************/
module.exports = {
    userModel: MODELS.users,
    sessionModel: MODELS.sessions,
    warehouseModel: MODELS.warehouses,
    warehouseLocationModel: MODELS.warehouselocations,
    roleModel: MODELS.userroles,
    inventoryModel: MODELS.inventories,
    varianceReportModel: MODELS.variancereports,
    groupedInventoryModel: MODELS.groupedinventories,
};