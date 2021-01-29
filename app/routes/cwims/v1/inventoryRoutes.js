'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);

// load controllers
const { inventoryController } = require(`../../../controllers`);

let routes = [];

module.exports = routes;