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
    declarationModel: MODELS.declarations,
    saleModel: MODELS.sales,
    saleProducts: MODELS.saleproducts,
    logsModel: MODELS.logs,
    sadItemModel: MODELS.saditems,
    stockTakeBufferModel: MODELS.stocktakebuffer,
    stockTakeModel: MODELS.stocktakes,
    declarationMessageModel: MODELS.declarationmessages,
    rackItemModel: MODELS.rackitems,
    inventoryModel: MODELS.inventories,
    varianceReportModel: MODELS.variancereports,
    groupedInventoryModel: MODELS.groupedinventories,
};