'use strict';

const CONSTANTS = require('../utils/constants');

let dbUtils = {};

/**
 * adding data initially 
 */
dbUtils.addInitialData = async (models) => {
    let officerUser = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES['CUSTOMS MANAGER'] } });
    let operatorUser = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'] } });
    let warehouses = await models['warehouse'].count();
    let warehouseLocations = await models['warehouseLocation'].count();
    let adminCount = await models['user'].count({ where: { role: CONSTANTS.USER_ROLES.ADMIN } });
    let roleData = await models['role'].count({ where: { nature: CONSTANTS.ROLE_NATURE.SYSTEM } });
    // await models['role'].destroy({ where: { nature: CONSTANTS.ROLE_NATURE.SYSTEM } });

    // adding initial data
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
            email: "whs1@yopmail.com",
            country: "US",
            postalCode: "10001",
            telephone: '123456723',
            startDate: new Date()
        })
    }

    let userTemp;
    if (!operatorUser) {
        userTemp = await models['user'].create({
            role: CONSTANTS.USER_ROLES['WAREHOUSE CLERK'],
            position: 0,
            firstName: "Joseph",
            lastName: "Adam",
            email: "joseph@yopmail.com",
            phoneNumber: "12345678977",
            street: "street 15",
            isAccountVerified: true,
            userCreatedOwnPassword: true,
            status: CONSTANTS.USER_STATUS.Approved,
            city: "New York",
            country: "US",
            postalCode: "10001",
            warehouseCode: "whs_1",
            password: "123456"
        })
    }

    if (!warehouseLocations) {
        await models['warehouseLocation'].create({
            whs_code: 'whs_1',
            code: 'comp_1',
            name: 'Company 1',
            isPublic: false,
            email: "comp1@yopmail.com",
            contactPerson: userTemp.id,
            street: "street 9",
            city: "New York",
            country: "US",
            postalCode: "10001",
            telephone: '123456789',
            startDate: new Date()
        });
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
            userCreatedOwnPassword: true,
            city: "New York",
            country: "US",
            postalCode: "10001",
            password: "123456"
        })
    }

    if (!adminCount) {
        let admin = {
            firstName: 'Adam',
            lastName: 'Brat',
            email: 'cwims.admin@yopmail.com',
            password: '123456',
            role: CONSTANTS.USER_ROLES.ADMIN,
            street: 'Street 9',
            city: 'New York',
            country: 'US',
            postalCode: '123456',
            countryIso: 'us',
            phoneNumber: '+11234567890',
            userCreatedOwnPassword: true,
            isAccountVerified: true,
            status: CONSTANTS.USER_STATUS.Approved
        }
        await models['user'].create(admin);
    }

    // updating values for inventory unit value
    // let inv_data = await models['inventory'].findAll();
    // inv_data.forEach(item => {
    //     item.unitValue = parseFloat(item.customsValue / item.initialQuantity).toFixed(3);
    //     item.save();
    // })

    return true;
}

async function addInitialRoles(model) {
    let data = [
        {
            id: 1,
            title: "Admin",
            type: CONSTANTS.ROLE_TYPE.ADMIN,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "logs": [
                    "view"
                ],
                "inventory": {
                    "list": [
                        "view"
                    ],
                    "variance-report": [
                        "listing",
                        "download"
                    ],
                    "grouped-items": [
                        "listing"
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
                    "listing"
                ]
            }
        },
        {
            id: 2,
            title: "API Consumer",
            type: CONSTANTS.ROLE_TYPE['API CONSUMER'],
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {}
        },
        {
            id: 3,
            title: "Warehouse Clerk",
            type: CONSTANTS.ROLE_TYPE.OPERATOR,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "error-logs": [
                    "view"
                ],
                "inventory": {
                    "grouped-items": [
                        "edit",
                        "ungroup-items"
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
                "declaration": [
                    "rack-items",
                    "reset-racked-items",
                    "upload"
                ]
            }
        },
        {
            id: 4,
            title: "Warehouse Manager",
            type: CONSTANTS.ROLE_TYPE.OPERATOR,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ], "error-logs": [
                    "view"
                ],
                "inventory": {
                    "grouped-items": [
                        "edit"
                    ],
                    "list": [
                        "group-items",
                        "delete"
                    ],
                    "variance-report": [
                        "listing",
                        "approve-reject",
                        "download"
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
                "declaration": [
                    "rack-items",
                    "reset-racked-items",
                    "upload"
                ]
            }
        },
        {
            id: 5,
            title: "Customs Clerk",
            type: CONSTANTS.ROLE_TYPE.CUSTOMS,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "error-logs": [
                    "view"
                ],
                "inventory": {
                    "variance-report": [
                        "listing",
                        "update",
                        "download"
                    ],
                    "list": [
                        "delete",
                        "stock-take"
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
                    "listing",
                    "approve-reject",
                    "delete-declaration"
                ]
            }
        },
        {
            id: 6,
            title: "Customs Manager",
            type: CONSTANTS.ROLE_TYPE.CUSTOMS,
            nature: CONSTANTS.ROLE_NATURE.SYSTEM,
            permissions: {
                "dashboard": [
                    "view"
                ],
                "error-logs": [
                    "view"
                ],
                "inventory": {
                    "variance-report": [
                        "listing",
                        "update",
                        "download"
                    ],
                    "list": [
                        "delete",
                        "stock-take"
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
                        "delete-user"
                    ]
                },
                "risk-management": [
                    "new-criteria",
                    "feedback",
                    "view-advisory",
                    "target-list"
                ],
                "declaration": [
                    "listing",
                    "approve-reject",
                    "delete-declaration"
                ]
            }
        }
    ]
    return await model.bulkCreate(data);
}

// async function addNationalities() {
//     let jsonArray = await csv().fromFile(__dirname + '/data.csv');
//     jsonArray = jsonArray.map(item => {
//         return item.Nationality
//     })
//     const obj = { "nationalities": jsonArray };
//     await fs.writeFileSync(__dirname + '/nationalities.json', JSON.stringify(obj));
//     return true;
// }

module.exports = dbUtils;