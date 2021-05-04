'use strict';

const { Joi } = require('../../../utils/joiUtils');

// load controllers
const { declarationController } = require(`../../../controllers`);

let routes = [
    {
        method: 'GET',
        path: '/v1/declaration/goods-received',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                skip: Joi.number().default(0),
                limit: Joi.number().default(10),
                // filters
                locationCode: Joi.string(),
                year: Joi.string(),
                serial: Joi.string(),
                number: Joi.number(),
                status: Joi.number(),
                dateReceived: Joi.string().description('Format: m/d/yyyy'),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1)
            },
            group: 'Declaration',
            description: 'Route to fetch received goods.',
            model: 'List_Goods_Received'
        },
        auth: true,
        handler: declarationController.fetchReceivedGoods
    },
    {
        method: 'POST',
        path: '/v1/declaration',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                office: Joi.string(),
                year: Joi.string(),
                serial: Joi.string(),
                number: Joi.string(),
                type: Joi.string(),
                stock: Joi.object({
                    locationCode: Joi.string(),
                    totalCustomsValue: Joi.number(),
                    totalSupValue: Joi.number(),
                    receiptItems: Joi.array().items(Joi.object({
                        lineNumber: Joi.number(),
                        origin: Joi.string(),
                        hsCode: Joi.string(),
                        description: Joi.string(),
                        itemTotalSupValue: Joi.number(),
                        qty: Joi.number(),
                        weight: Joi.number(),
                        customsValue: Joi.number()
                    }))
                })
            },
            group: 'Declaration',
            description: 'Route to add received goods.',
            model: 'Add_declaration'
        },
        auth: true,
        handler: declarationController.addDeclaration
    },
    {
        method: 'DELETE',
        path: '/v1/declaration',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                id: Joi.string().required()
            },
            group: 'Declaration',
            description: 'Route to delete declaration.',
            model: 'Delete_declaration'
        },
        auth: true,
        handler: declarationController.deleteDeclaration
    },
    {
        method: 'GET',
        path: '/v1/declaration/fetch-declaration-by-id',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                id: Joi.string()
            },
            group: 'Declaration',
            description: 'Route to fetch declaration by Id.',
            model: 'Fetch_declaration_by_Id'
        },
        auth: true,
        handler: declarationController.fetchDeclarationById
    },
    {
        method: 'GET',
        path: '/v1/declaration/fetch-sad-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                id: Joi.string().description('Declaration id'),
                skip: Joi.number().default(0),
                limit: Joi.number().default(10),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1)
            },
            group: 'Declaration',
            description: 'Route to fetch SAD Items.',
            model: 'Fetch_SAD_Items'
        },
        auth: true,
        handler: declarationController.fetchSADItems
    },
    {
        method: 'GET',
        path: '/v1/declaration/get-filters',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            group: 'Declaration',
            description: 'Route to fetch filters.',
            model: 'Get_filters'
        },
        auth: true,
        handler: declarationController.getFilters
    },
    {
        method: 'POST',
        path: '/v1/declaration/rack-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                sadItemId: Joi.number().required()
            },
            body: {
                items: Joi.array().items(Joi.object({
                    productID: Joi.string().required(),
                    description: Joi.string().required(),
                    weight: Joi.number().required(),
                    qty: Joi.number().required(),
                    supplementryValue: Joi.number().required(),
                    customsValue: Joi.number().required()
                }))
            },
            group: 'Declaration',
            description: 'Route to rack items.',
            model: 'Rack_items'
        },
        auth: true,
        handler: declarationController.rackItems
    },
    {
        method: 'GET',
        path: '/v1/declaration/fetch-rack-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                sadItemId: Joi.number().required(),
                sortKey: Joi.string().default('createdAt'),
                sortDirection: Joi.number().default(-1)
            },
            group: 'Declaration',
            description: 'Route to fetch rack items.',
            model: 'Fetch_rack_items'
        },
        auth: true,
        handler: declarationController.fetchRackItems
    },
    {
        method: 'POST',
        path: '/v1/declaration/upload',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                declarationId: Joi.string().required()
            },
            formData: {
                file: Joi.any().meta({ swaggerType: 'file' }).required().description('Data file'),
            },
            group: 'Declaration',
            description: 'Route to upload racked goods from CSV.',
            model: 'Upload_Racked_Goods'
        },
        auth: true,
        handler: declarationController.upload
    },
    {
        method: 'POST',
        path: '/v1/declaration/submit-request',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                id: Joi.string().required(),
                resubmit: Joi.boolean().default(false)
            },
            group: 'Declaration',
            description: 'Route to submit request.',
            model: 'Submit_request'
        },
        auth: true,
        handler: declarationController.submitRequest
    },
    {
        method: 'POST',
        path: '/v1/declaration/approve-reject-request',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                id: Joi.string().required().description('Declaration ID'),
                reason: Joi.string(),
                operation: Joi.number().required().description("1 => APPROVE | 2 => REJECT")
            },
            group: 'Declaration',
            description: 'Route to approve/reject request.',
            model: 'Accept_Reject_Request'
        },
        auth: true,
        handler: declarationController.acceptOrRejectRequest
    },
    {
        method: 'GET',
        path: '/v1/declaration/get-messages',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            query: {
                id: Joi.string().required().description('Declaration id'),
                skip: Joi.number().default(0),
                limit: Joi.number().default(10)
            },
            group: 'Declaration',
            description: 'Route to get messages.',
            model: 'Get_messages'
        },
        auth: true,
        handler: declarationController.getMessages
    },
    {
        method: 'POST',
        path: '/v1/declaration/reply-to-message',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                id: Joi.number().required(),
                reply: Joi.string().required()
            },
            group: 'Declaration',
            description: 'Route to reply to messages.',
            model: 'Reply_to_messages'
        },
        auth: true,
        handler: declarationController.replytoMessage
    },
    {
        method: 'POST',
        path: '/v1/declaration/reset-racked-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                sadItemId: Joi.string(),
                declarationId: Joi.string()
            },
            group: 'Declaration',
            description: 'Route to reset racked items.',
            model: 'Reset_racked_items'
        },
        auth: true,
        handler: declarationController.resetRackedItems
    },
    {
        method: 'PUT',
        path: '/v1/declaration/modify-racked-items',
        joiSchemaForSwagger: {
            headers: {
                authorization: Joi.string().required()
            },
            body: {
                id: Joi.string().required().description('Racked ID'),
                productCode: Joi.number(),
                description: Joi.string(),
                quantity: Joi.number(),
                customValue: Joi.number(),
                supplementryValue: Joi.number()
            },
            group: 'Declaration',
            description: 'Route to modify racked items.',
            model: 'Modify_racked_items'
        },
        auth: true,
        handler: declarationController.updateRackedItems
    }
]

module.exports = routes;