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
    declarationController: require(`./cwims/declarationController`),
    salesController: require(`./cwims/salesController`),
    fileUploadController: require(`./cwims/fileUploadController`)
};