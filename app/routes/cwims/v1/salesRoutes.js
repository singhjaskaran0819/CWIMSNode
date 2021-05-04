'use strict';

const { Joi } = require('../../../utils/joiUtils');

// load controllers
const { salesController } = require(`../../../controllers`);

let routes = [
    {
        method: 'POST',
        path: '/v1/sales',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            body: {
                saleCurrency: Joi.number(),
                saleValue: Joi.number(),
                receiptNumber: Joi.string(),
                warehouseCode: Joi.string(),
                companyCode: Joi.string(),
                customerSaleType: Joi.number(),
                customerName: Joi.string(),
                customerAddress: Joi.string(),
                customerIdType: Joi.number(),
                customerIdNumber: Joi.string(),
                customerIdCtyIssue: Joi.string(),
                customerNationality: Joi.string(),
                countryOfResidency: Joi.string(),
                customerTransportId: Joi.string(),
                vesselName: Joi.string(),
                departure: Joi.string(),
                portDeparture: Joi.string(),
                ticketNumber: Joi.string(),
                customerTransportType: Joi.string(),
                products: Joi.array().items(Joi.object({
                    productID: Joi.string(),
                    description: Joi.string(),
                    qty: Joi.number(),
                    saleValue: Joi.number()
                }))
            },
            group: 'Sales',
            description: 'Route to add new sale.',
            model: 'Add_sale'
        },
        // auth: true,
        handler: salesController.createNewSale
    },
    {
        method: 'GET',
        path: '/v1/sales',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            query: {
                limit: Joi.number().default(10),
                skip: Joi.number().default(0),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1),

                // filters
                customerSaleType: Joi.number(),
                saleCurrency: Joi.number(),
                countryOfResidency: Joi.string(),
                customerIdType: Joi.number(),
                warehouseCode: Joi.string(),
                companyCode: Joi.string()
            },
            group: 'Sales',
            description: 'Route to list sales.',
            model: 'List_sales'
        },
        // auth: true,
        handler: salesController.listSales
    },
    {
        method: 'PUT',
        path: '/v1/sales',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            body: {
                id: Joi.string().required(),
                isDraft: Joi.boolean(),
                saleCurrency: Joi.number(),
                saleValue: Joi.number(),
                receiptNumber: Joi.string(),
                warehouseCode: Joi.string(),
                companyCode: Joi.string(),
                customerSaleType: Joi.number(),
                customerName: Joi.string(),
                customerAddress: Joi.string(),
                customerIdType: Joi.number(),
                customerIdNumber: Joi.string(),
                customerIdCtyIssue: Joi.string(),
                customerNationality: Joi.string(),
                countryOfResidency: Joi.string(),
                customerTransportId: Joi.string(),
                vesselName: Joi.string(),
                departure: Joi.string(),
                status: Joi.number(),
                portDeparture: Joi.string(),
                ticketNumber: Joi.string(),
                customerTransportType: Joi.string()
            },
            group: 'Sales',
            description: 'Route to update sale.',
            model: 'Update_sale'
        },
        // auth: true,
        handler: salesController.updateSale
    },
    {
        method: 'DELETE',
        path: '/v1/sales',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            query: {
                id: Joi.string().required()
            },
            group: 'Sales',
            description: 'Route to delete sale.',
            model: 'Delete_sale'
        },
        // auth: true,
        handler: salesController.deleteSale
    },
    {
        method: 'GET',
        path: '/v1/sales/getDropDownData',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            group: 'Sales',
            description: 'Route to get drop down values.',
            model: 'Get_drop_down_values'
        },
        // auth: true,
        handler: salesController.getDropDownValues
    },
    {
        method: 'GET',
        path: '/v1/sales/get-filters',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            group: 'Sales',
            description: 'Route to get filter list.',
            model: 'Get_filter_list'
        },
        // auth: true,
        handler: salesController.getFilters
    },
    {
        method: 'GET',
        path: '/v1/sales/search-product',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            query: {
                keyword: Joi.string().required()
            },
            group: 'Sales',
            description: 'Route to search product.',
            model: 'Search_product'
        },
        // auth: true,
        handler: salesController.searchProduct
    }
]

module.exports = routes;