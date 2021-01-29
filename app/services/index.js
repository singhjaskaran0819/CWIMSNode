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
    roleService: require(`./cwims/roleService`),
    warehouseService: require(`./cwims/warehouseService`),
    inventoryService: require(`./cwims/inventoryService`),
    fileUploadService: require(`./cwims/fileUploadService`)
};