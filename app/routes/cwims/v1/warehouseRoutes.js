'use strict';

const { Joi } = require('../../../utils/joiUtils');

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
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),
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
                postalCode: Joi.string(),
                isStockTakeProcess: Joi.boolean()
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
    },

    // CRUD Operations
    {
        method: 'POST',
        path: '/v1/warehouse/add-warehouse',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                code: Joi.string(),
                email: Joi.string(),
                name: Joi.string(),
                isPublic: Joi.boolean().default(false),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                telephone: Joi.string(),
                startDate: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to add warehouse.',
            model: 'Add_Warehouse'
        },
        auth: true,
        handler: warehouseController.addWarehouse
    },
    {
        method: 'POST',
        path: '/v1/warehouse/add-warehouse-location',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                code: Joi.string(),
                whs_code: Joi.string(),
                contactPerson: Joi.string(),
                name: Joi.string(),
                email: Joi.string(),
                isPublic: Joi.boolean().default(false),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                telephone: Joi.string(),
                startDate: Joi.string()
            },
            group: 'Warehouse Location',
            description: 'Route to add warehouse location.',
            model: 'Add_Warehouse_location'
        },
        auth: true,
        handler: warehouseController.addWarehouseLocation
    },
    {
        method: 'PUT',
        path: '/v1/warehouse/update-warehouse',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                code: Joi.string().required(),
                email: Joi.string(),
                name: Joi.string(),
                isPublic: Joi.boolean().default(false),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                telephone: Joi.string(),
                startDate: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to update warehouse.',
            model: 'Update_Warehouse'
        },
        auth: true,
        handler: warehouseController.updateWarehouse
    },
    {
        method: 'PUT',
        path: '/v1/warehouse/update-warehouse-location',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                code: Joi.string().required(),
                whs_code: Joi.string(),
                contactPerson: Joi.string(),
                name: Joi.string(),
                email: Joi.string(),
                isPublic: Joi.boolean().default(false),
                street: Joi.string(),
                city: Joi.string(),
                country: Joi.string(),
                postalCode: Joi.string(),
                telephone: Joi.string(),
                startDate: Joi.string()
            },
            group: 'Warehouse Location',
            description: 'Route to update warehouse location.',
            model: 'Update_Warehouse_location'
        },
        auth: true,
        handler: warehouseController.UpdateWarehouseLocation
    },
    {
        method: 'DELETE',
        path: '/v1/warehouse/delete-warehouse/:code',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            params: {
                code: Joi.string()
            },
            group: 'Warehouse',
            description: 'Route to delete warehouse.',
            model: 'Delete_Warehouse'
        },
        auth: true,
        handler: warehouseController.deleteWarehouse
    },
    {
        method: 'DELETE',
        path: '/v1/warehouse/delete-warehouse-location/:code',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            params: {
                code: Joi.string()
            },
            group: 'Warehouse Location',
            description: 'Route to delete warehouse location.',
            model: 'Delete_Warehouse_Location'
        },
        auth: true,
        handler: warehouseController.deleteWarehouseLocation
    },
    {
        method: 'GET',
        path: '/v1/warehouse/fetch-sub-locations/:code',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required()
            // },
            params: {
                code: Joi.string()
            },
            group: 'Warehouse Location',
            description: 'Route to fetch sub locations.',
            model: 'Fetch_sub_Location'
        },
        // auth: true,
        handler: warehouseController.fetchSubLocations
    }
]

module.exports = routes;