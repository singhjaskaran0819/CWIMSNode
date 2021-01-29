'use strict';

const { MESSAGES, ERROR_TYPES } = require('../../utils/constants');
const HELPERS = require("../../helpers");
const sessionService = require(`./sessionService`);
const userService = require('./userService');
const roleService = require('./roleService');

let authService = {};

/**
 * function to authenticate user.
 */
authService.userValidate = () => {
    return (request, response, next) => {
        validateUser(request).then((isAuthorized) => {
            if (isAuthorized) {
                return next();
            }
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        }).catch((err) => {
            let responseObject = HELPERS.responseHelper.createErrorResponse(MESSAGES.UNAUTHORIZED, ERROR_TYPES.UNAUTHORIZED);
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
};


/**
 * function to validate user's jwt token and fetch its details from the system.
 */
let validateUser = async (request) => {
    try {
        let authenticatedUser;
        let checkSession = await sessionService.getSession({ accessToken: request.headers.authorization });
        if (checkSession) {
            authenticatedUser = await userService.getUser({ id: checkSession.userId, role: checkSession.role }, { exclude: ['password'] }, true);
            authenticatedUser = authenticatedUser.toJSON();
            Object.assign(authenticatedUser, { accessToken: request.headers.authorization });
        }
        if (authenticatedUser) {
            request.user = authenticatedUser;
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
};

/**
 * function to validate user's token from axxon server if it is valid or not.
 */
authService.validateToken = async (token) => {
    let isValidToken = true;
    return isValidToken;
};

/**
 * function to authenticate socket users
 */
// authService.socketAuthentication = async (socket, next) => {
//     try {
//         const token = socket.handshake.query.authToken;
//         if (token) {
//             const socketUser = await sessionModel.findOne({ token: token }).lean();
//             if (socketUser) {
//                 socket.id = socketUser.userId;
//                 return next();
//             }
//             else {
//                 return next(new Error("Socket authentication Error"));
//             }
//         }
//         return next(new Error("Socket authentication Error"));
//     } catch (err) {
//         return next(new Error("Socket unhandled authentication Error"));
//     }
// };

module.exports = authService;