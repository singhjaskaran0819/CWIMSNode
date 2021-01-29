'use strict';
const CONFIG = require('../../config');
/********************************
 **** Managing all the controllers ***
 ********* independently ********
 ********************************/
module.exports = {
    userController: require(`./cwims/userController`),
    warehouseController: require(`./cwims/warehouseController`),
    roleController: require(`./cwims/roleController`),
    inventoryController: require(`./cwims/inventoryController`),
    fileUploadController: require(`./cwims/fileUploadController`)
};