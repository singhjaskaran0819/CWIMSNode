'use strict';

/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
    ...require('./warehouseRoutes'),
    ...require('./roleRoutes'),
    ...require('./inventoryRoutes'),
    ...require('./salesRoutes'),
    ...require('./declarationRoutes'),
    ...require('./fileUploadRoutes')
]

module.exports = v1Routes;