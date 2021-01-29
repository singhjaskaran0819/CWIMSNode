'use strict';

const _ = require('lodash');
const sequelize = require('sequelize');
const { Op } = sequelize;
const { INVENTORY_STATUSES } = require('../../utils/constants');
const { inventoryModel, warehouseLocationModel, warehouseModel, varianceReportModel, groupedInventoryModel } = require('../../models');

let inventoryService = {};

module.exports = inventoryService;
