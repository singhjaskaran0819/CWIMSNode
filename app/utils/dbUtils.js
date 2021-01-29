'use strict';

const CONSTANTS = require('../utils/constants');
const utils = require('../utils/utils');
const _ = require('lodash');
const { Op } = require('sequelize');

let dbUtils = {};

/**
 * adding data initially 
 */
dbUtils.addInitialData = async (models) => {
    let officerUser = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } });
    let operatorUser = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'] } });
    let warehouses = await models['warehouse'].count();
    let warehouseLocations = await models['warehouseLocation'].count();
    let inventories = await models['inventory'].count();
    let adminCount = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES.ADMIN } });
    let roleData = await models['role'].count({ where: { nature: CONSTANTS.ROLE_NATURE.SYSTEM } });

    // adding intital data
    if (!roleData) {
        await addInitialRoles(models['role']);
    }

    if (!warehouses) {
        await models['warehouse'].create({
            code: 'whs_1',
            name: 'WHS 1',
            isPublic: false,
            street: "street 11",
            city: "New York",
            country: "US",
            postalCode: "10001",
            telephone: '123456723',
            startDate: new Date()
        })
    }

    if (!warehouseLocations) {
        await models['warehouseLocation'].create({
            whs_code: 'whs_1',
            code: 'comp_1',
            name: 'Company 1',
            isPublic: false,
            street: "street 9",
            city: "New York",
            country: "US",
            postalCode: "10001",
            telephone: '123456789',
            startDate: new Date()
        });
    }

    if (!inventories) {
        await models['inventory'].create({
            productId: 'PROD001',
            locationCode: 'comp_1',
            name: 'ABC',
            year: '2015',
            number: 12,
            serial: 'L',
            status: 3,
            customValue: 400,
            tariffCode: '123456789',
            description: 'Good item',
            initialQuantity: 40,
            remainingQuantity: 40
        });
        await models['inventory'].create({
            productId: 'PROD002',
            locationCode: 'comp_1',
            year: '2015',
            name: 'DEF',
            number: 13,
            serial: 'P',
            status: 2,
            customValue: 400,
            tariffCode: '123456789',
            description: 'Great item',
            initialQuantity: 20,
            remainingQuantity: 20
        })
    }

    if (!operatorUser) {
        await models['user'].create({
            role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'],
            position: 0,
            firstName: "Joseph",
            lastName: "Adam",
            email: "joseph@yopmail.com",
            phoneNumber: "12345678977",
            street: "street 15",
            isAccountVerified: true,
            status: CONSTANTS.USER_STATUS.Approved,
            city: "New York",
            country: "US",
            postalCode: "10001",
            warehouseCode: "whs_1",
            password: "123456"
        })
    }

    if (!officerUser) {
        await models['user'].create({
            role: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'],
            position: 3,
            firstName: "John",
            lastName: "Brat",
            warehouseCode: "whs_1",
            email: "john@yopmail.com",
            phoneNumber: "+128846541131",
            isAccountVerified: true,
            status: CONSTANTS.USER_STATUS.Approved,
            street: "street 1",
            city: "New York",
            country: "US",
            postalCode: "10001",
            password: "123456"
        })
    }

    if (!adminCount) {
        let admin = {
            firstName: process.env.ADMIN_FIRSTNAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: CONSTANTS.USER_ROLES.ADMIN,
            isAccountVerified: true,
            status: CONSTANTS.USER_STATUS.Approved
        }
        await models['user'].create(admin);
    }

    return true;
}

async function addInitialRoles(model) {
    let data = [
        {
            id: 1,
            title: "Admin",
            // type: CONSTANTS.ROLE_TYPE.ADMIN,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "inventory": {
                    "variance-report": [
                        "stock-take"
                    ],
                    "grouped-items": [
                        "edit"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ]
                },
                "warehouse": [
                    "listing"
                ],
                "appointment": [
                    "add-appointment"
                ],
                "sales": {
                    "create-new-sale": [
                        "listing"
                    ],
                    "list-sales": [
                        "listing"
                    ]
                },
                "standard-report": [
                    "request-report",
                    "edit"
                ],
                "reports": [
                    "approve",
                    "reject"
                ],
                "user-management": {
                    "list-of-user": [
                        "approve-reject-user",
                        "delete-user",
                        "create-new-user",
                        "suspend-user",
                        "reassign-role"
                    ],
                    "manage-role": [
                        "view-permissions",
                        "create-role",
                        "delete-role",
                        "update-role"
                    ]
                },
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "rack"
                ]
            }
        },
        {
            id: 2,
            title: "API Consumer",
            // type: CONSTANTS.ROLE_TYPE.API_CONSUMER,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {}
        },
        {
            id: 3,
            title: "Warehouse Clerk",
            // type: CONSTANTS.ROLE_TYPE.OPERATOR,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "inventory": {
                    "grouped-items": [
                        "edit"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ]
                },
                "warehouse": [
                    "listing"
                ],
                "appointment": [
                    "add-appointment"
                ],
                "sales": {
                    "create-new-sale": [
                        "listing"
                    ],
                    "list-sales": [
                        "listing"
                    ]
                },
                "standard-report": [
                    "request-report",
                    "edit"
                ],
                "reports": [
                    "approve",
                    "reject"
                ],
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "listing"
                ]
            }
        },
        {
            id: 4,
            title: "Warehouse Manager",
            // type: CONSTANTS.ROLE_TYPE.OFFICER,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "inventory": {
                    "grouped-items": [
                        "edit"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ]
                },
                "warehouse": [
                    "listing"
                ],
                "appointment": [
                    "add-appointment"
                ],
                "sales": {
                    "create-new-sale": [
                        "listing"
                    ],
                    "list-sales": [
                        "listing"
                    ]
                },
                "standard-report": [
                    "request-report",
                    "edit"
                ],
                "reports": [
                    "approve",
                    "reject"
                ],
                "user-management": {
                    "list-of-user": [
                        "approve-reject-user"
                    ]
                },
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "listing"
                ]
            }
        },
        {
            id: 5,
            title: "Customs Clerk",
            // type: CONSTANTS.ROLE_TYPE.OPERATOR,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "inventory": {
                    "variance-report": [
                        "stock-take"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ]
                },
                "warehouse": [
                    "listing"
                ],
                "appointment": [
                    "add-appointment"
                ],
                "sales": {
                    "create-new-sale": [
                        "listing"
                    ],
                    "list-sales": [
                        "listing"
                    ]
                },
                "standard-report": [
                    "request-report",
                    "edit"
                ],
                "reports": [
                    "approve",
                    "reject"
                ],
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "listing"
                ]
            }
        },
        {
            id: 6,
            title: "Customs Manager",
            // type: CONSTANTS.ROLE_TYPE.OFFICER,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "inventory": {
                    "variance-report": [
                        "stock-take"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ]
                },
                "warehouse": [
                    "listing"
                ],
                "appointment": [
                    "add-appointment"
                ],
                "sales": {
                    "create-new-sale": [
                        "listing"
                    ],
                    "list-sales": [
                        "listing"
                    ]
                },
                "standard-report": [
                    "request-report",
                    "edit"
                ],
                "reports": [
                    "approve",
                    "reject"
                ],
                "user-management": {
                    "list-of-user": [
                        "approve-reject-user"
                    ]
                },
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "listing"
                ]
            }
        }
    ]
    return await model.bulkCreate(data);
}

module.exports = dbUtils;