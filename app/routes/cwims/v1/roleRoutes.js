'use strict';

const { Joi } = require('../../../utils/joiUtils');

// load controllers
const { roleController } = require(`../../../controllers`);

let routes = [
    {
        method: 'POST',
        path: '/v1/role',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            body: {
                title: Joi.string().required(),
                permissions: Joi.object()
            },
            group: 'Role',
            description: 'Route to add new role.',
            model: 'Add_role'
        },
        // auth: true,
        handler: roleController.addNewRole
    },
    {
        method: 'GET',
        path: '/v1/role',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            group: 'Role',
            description: 'Route to fetch roles.',
            model: 'Fetch_roles'
        },
        // auth: true,
        handler: roleController.fetchRoles
    },
    {
        method: 'PUT',
        path: '/v1/role',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            body: {
                id: Joi.number().required(),
                title: Joi.string(),
                permissions: Joi.object()
            },
            group: 'Role',
            description: 'Route to update role.',
            model: 'Update_role'
        },
        // auth: true,
        handler: roleController.updateRole
    },
    {
        method: 'DELETE',
        path: '/v1/role',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            query: {
                id: Joi.number().required()
            },
            group: 'Role',
            description: 'Route to delete role.',
            model: 'Delete_role'
        },
        // auth: true,
        handler: roleController.deleteRole
    },
    {
        method: 'GET',
        path: '/v1/role/fetch-by-id',
        joiSchemaForSwagger: {
            // headers: {
            //     authorization: Joi.string().required().description('User auth token')
            // },
            query: {
                id: Joi.number().required()
            },
            group: 'Role',
            description: 'Route to fetch role by ID.',
            model: 'Fetch_role'
        },
        // auth: true,
        handler: roleController.fetchRole
    }
]

module.exports = routes;
