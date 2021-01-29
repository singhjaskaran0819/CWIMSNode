'use strict';

const { Joi } = require('../../../utils/joiUtils');
const { AVAILABLE_AUTHS } = require(`../../../utils/constants`);

// load controllers
const warehouseController = require(`../../../controllers/cwims/warehouseController`);

let routes = [
    {
        method: 'GET',
        path: '/v1/warehouse/list',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                signupList: Joi.boolean().default(false),
                limit: Joi.number().default(10),
                skip: Joi.number().default(0),
                warehouseCode: Joi.string(),
                locationCode: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                location_city: Joi.string(),
                location_country: Joi.string(),
                location_postalCode: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to fetch/search list of warehouses.',
            model: 'Warehouse_Listing_And_Searching'
        },
        auth: true,
        handler: warehouseController.fetchList
    },
    {
        method: 'GET',
        path: '/v1/warehouse/code-list',
        joiSchemaForSwagger: {
            group: 'Warehouse',
            description: 'Route to fetch list of warehouse codes and names.',
            model: 'Warehouse_Code_And_Name'
        },
        handler: warehouseController.fetchListOfCodeAndName
    },
    {
        method: 'GET',
        path: '/v1/warehouse/get-warehouse-location-filters',
        joiSchemaForSwagger: {
            query: {
                warehouseCode: Joi.string().required()
            },
            group: 'Warehouse',
            description: 'Route to fetch warehouse location filters.',
            model: 'Warehouse_Location_Filters'
        },
        handler: warehouseController.fetchWarehouseLocationFilters
    },
    {
        method: 'GET',
        path: '/v1/warehouse/fetch-by-code',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                code: Joi.string().required(),
                skip: Joi.number(),
                limit: Joi.number(),
                infinteScroll: Joi.boolean().default(false),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to fetch warehouse by code.',
            model: 'Warehouse_Fetch_By_Code'
        },
        auth: true,
        handler: warehouseController.fetchByCode
    },
    {
        method: 'GET',
        path: '/v1/warehouse/fetch-location-by-code',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                code: Joi.string().required()
            },
            group: 'Warehouse',
            description: 'Route to fetch warehouse location by code.',
            model: 'Warehouse_Location_Fetch_By_Code'
        },
        auth: true,
        handler: warehouseController.fetchLocationByCode
    },
    {
        method: 'GET',
        path: '/v1/warehouse/get-filters',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                warehouseCode: Joi.string(),
                locationCode: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to fetch filters.',
            model: 'Fetch_filters'
        },
        auth: true,
        handler: warehouseController.getFilters
    }
]

module.exports = routes;