'use strict';

const { Joi } = require('../../../utils/joiUtils');

// load controllers
const { inventoryController } = require(`../../../controllers`);

let routes = [
    {
        method: 'GET',
        path: '/v1/inventory/list',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                searchKey: Joi.string(),
                skip: Joi.number().default(0),
                limit: Joi.number().default(10),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),
                // filters
                whs_code: Joi.string(),
                year: Joi.string(),
                serial: Joi.string(),
                number: Joi.number(),
                tariffCode: Joi.string(),
                locationCode: Joi.string(),
                status: Joi.string()
            },
            group: 'Inventory',
            description: 'Route to list inventory.',
            model: 'List_Inventory'
        },
        auth: true,
        handler: inventoryController.listInventory
    },
    {
        method: 'GET',
        path: '/v1/inventory/fetch-by-id',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                id: Joi.string(),
                productID: Joi.string(),
            },
            group: 'Inventory',
            description: 'Route to fetch inventory.',
            model: 'Fetch_Inventory'
        },
        auth: true,
        handler: inventoryController.fetchInventoryById
    },
    {
        method: 'GET',
        path: '/v1/inventory/get-filters',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required()
            // },
            query: {
                groupedItemsFlag: Joi.boolean().default(false),
                varianceReports: Joi.boolean().default(false),
                stockTake: Joi.boolean().default(false),
            },
            group: 'Inventory',
            description: 'Route to get filters.',
            model: 'Get_Filters'
        },
        // auth: true,
        handler: inventoryController.getFilters
    },
    {
        method: 'POST',
        path: '/v1/inventory/generate-variance-report',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                stocktakeSerial: Joi.number().required()
            },
            group: 'Inventory',
            description: 'Route to generate variance report.',
            model: 'Generate_variance_report'
        },
        auth: true,
        handler: inventoryController.generateVarianceReport
    },
    {
        method: 'GET',
        path: '/v1/inventory/get-variance-reports',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                skip: Joi.number().default(0),
                limit: Joi.number().default(10),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),

                // filters
                difference: Joi.number().description("0 => EQUALS TO 0 | 1 => GREATER THAN 0"),
                locationCode: Joi.string(),
                status: Joi.string(),
                startDate: Joi.string(),
                endDate: Joi.string(),
                createCSV: Joi.boolean().default(false)
            },
            group: 'Inventory',
            description: 'Route to get variance reports.',
            model: 'Get_variance_reports'
        },
        auth: true,
        handler: inventoryController.getVarianceReports
    },
    {
        method: 'PUT',
        path: '/v1/inventory/approve-reject-variance-report',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                ids: Joi.array().items(Joi.string().required()),
                rejectionReason: Joi.string(),
                operation: Joi.number().required().description("1 => APPROVE | 2 => REJECT")
            },
            group: 'Inventory',
            description: 'Route to approve/reject variance reports.',
            model: 'Approve_Reject_variance_reports'
        },
        auth: true,
        handler: inventoryController.approveOrRejectVarianceReports
    },
    {
        method: 'PUT',
        path: '/v1/inventory/update-stock',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                // reportId: Joi.string(),
                operation: Joi.number().required().description("1 = ADD_ITEM | 2 = ADD_QUANTITY | 3 = REPLACE | 4 = CANCEL")
            },
            body: {
                products: Joi.array().items(Joi.object({
                    productID: Joi.string().required()
                }))
            },
            group: 'Inventory',
            description: 'Route to update stock.',
            model: 'Update_Stock'
        },
        auth: true,
        handler: inventoryController.updateStock
    },
    {
        method: 'GET',
        path: '/v1/inventory/get-all-products',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                // subLocation: Joi.string(),
                locationCode: Joi.string().required(),
                searchKey: Joi.string().required()
            },
            group: 'Inventory',
            description: 'Route to get products belong to specific office.',
            model: 'Get_products'
        },
        auth: true,
        handler: inventoryController.getProductsForSpecificLocation
    },
    {
        method: 'POST',
        path: '/v1/inventory/group-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                productCode: Joi.string().required(),
                locationCode: Joi.string().required(),
                description: Joi.string().required(),
                groupQty: Joi.number().required(),
                products: Joi.array().items(Joi.object({
                    productId: Joi.string().required(),
                    quantity: Joi.number().required()
                }))
            },
            group: 'Inventory',
            description: 'Route to group items.',
            model: 'Group_items'
        },
        auth: true,
        handler: inventoryController.groupItems
    },
    {
        method: 'GET',
        path: '/v1/inventory/fetch-grouped-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                skip: Joi.number().default(0),
                limit: Joi.number().default(10),
                itemData: Joi.boolean().default(false),
                productCode: Joi.string(),
                locationCode: Joi.string(),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1)
            },
            group: 'Inventory',
            description: 'Route to get grouped items.',
            model: 'Get_grouped_items'
        },
        auth: true,
        handler: inventoryController.getGroupedItems
    },
    {
        method: 'POST',
        path: '/v1/inventory/ungroup-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                productCode: Joi.string().required()
            },
            group: 'Inventory',
            description: 'Route to ungroup items.',
            model: 'Ungroup_items'
        },
        auth: true,
        handler: inventoryController.ungroupItems
    },

    // stock take buffer routes
    {
        method: 'POST',
        path: '/v1/inventory/add-stocktake-item',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                productID: Joi.string().required(),
                qty: Joi.number().required(),
                description: Joi.string(),
                locationCode: Joi.string(),
                warehouseCode: Joi.string(),
                stockTakeSerial: Joi.number(),
                subLocation: Joi.string(),
                inventoryItemStatus: Joi.number()
            },
            group: 'Inventory',
            description: 'Route to add stock take buffer items.',
            model: 'Add_Stock_Take_items'
        },
        auth: true,
        handler: inventoryController.addStockTakeItems
    },
    {
        method: 'POST',
        path: '/v1/inventory/create-stocktake',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                locationCode: Joi.string().required(),
                // subLocation: Joi.string()
            },
            group: 'Inventory',
            description: 'Route to create stock take.',
            model: 'Create_stock_take'
        },
        auth: true,
        handler: inventoryController.createStock
    },
    {
        method: 'GET',
        path: '/v1/inventory/fetch-stocktake',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                serial: Joi.number().required()
            },
            group: 'Inventory',
            description: 'Route to fetch stock take.',
            model: 'Fetch_stock_take'
        },
        // auth: true,
        handler: inventoryController.fetchStocktake
    },
    {
        method: 'PUT',
        path: '/v1/inventory/edit-stocktake',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                serial: Joi.number(),
                year: Joi.string(),
                locationCode: Joi.string(),
                status: Joi.number()
            },
            group: 'Inventory',
            description: 'Route to update stock take.',
            model: 'Update_stock_take'
        },
        auth: true,
        handler: inventoryController.updateStocktake
    },
    {
        method: 'GET',
        path: '/v1/inventory/list-stocktakes',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                locationCode: Joi.string(),
                year: Joi.string(),
                limit: Joi.number().default(10),
                skip: Joi.number().default(0),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),
            },
            group: 'Inventory',
            description: 'Route to list stock takes.',
            model: 'List_Stock_Take'
        },
        auth: true,
        handler: inventoryController.listStockTake
    },
    {
        method: 'GET',
        path: '/v1/inventory/list-stocktake-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                searchKey: Joi.string(),
                stocktakeSerial: Joi.number(),
                limit: Joi.number().default(10),
                skip: Joi.number().default(0),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),
            },
            group: 'Inventory',
            description: 'Route to list stock take buffer items.',
            model: 'List_Stock_Take_items'
        },
        auth: true,
        handler: inventoryController.listStockTakeItems
    },
    {
        method: 'DELETE',
        path: '/v1/inventory/delete-stocktake-item',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                productID: Joi.string().required()
            },
            group: 'Inventory',
            description: 'Route to delete stock take buffer items.',
            model: 'Delete_Stock_Take_items'
        },
        auth: true,
        handler: inventoryController.deleteStockTakeItems
    },
    {
        method: 'PUT',
        path: '/v1/inventory/edit-stocktake-item',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                id: Joi.string().required(),
                productID: Joi.string(),
                stockTakeSerial: Joi.number(),
                subLocation: Joi.string(),
                description: Joi.string(),
                qty: Joi.number(),
            },
            group: 'Inventory',
            description: 'Route to update stock take buffer items.',
            model: 'Update_Stock_Take_items'
        },
        auth: true,
        handler: inventoryController.updateStockTakeItems
    },
    {
        method: 'GET',
        path: '/v1/inventory/check-productId',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                productID: Joi.string().required()
            },
            group: 'Inventory',
            description: 'Route to check if product ID exists.',
            model: 'CHECK_IF_PRODUCT_ID_EXISTS'
        },
        auth: true,
        handler: inventoryController.checkProductId
    }
]

module.exports = routes;