const CONFIG = require('../../config');
/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    swaggerService: require(`./cwims/swaggerService`),
    authService: require(`./cwims/authService`),
    sessionService: require(`./cwims/sessionService`),
    userService: require(`./cwims/userService`),
    cronService: require(`./cwims/cronService`),
    roleService: require(`./cwims/roleService`),
    logsService: require(`./cwims/logsService`),
    warehouseService: require(`./cwims/warehouseService`),
    salesService: require(`./cwims/salesService`),
    inventoryService: require(`./cwims/inventoryService`),
    stockTakeBufferService: require(`./cwims/stockTakeBufferService`),
    declarationService: require(`./cwims/declarationService`),
    fileUploadService: require(`./cwims/fileUploadService`)
};