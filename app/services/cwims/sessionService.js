const CONFIG = require('../../../config');
const MODELS = require(`../../models`);

let sessionService = {};

/**
 * function to create user's session in the database.
 */
sessionService.createSession = async (dataToSave) => {
    return await MODELS.sessionModel.create(dataToSave);
};

/**
 * function to update user's session in the database.
 */
sessionService.updateSession = async (criteria, dataToUpdate) => {
    return await MODELS.sessionModel.update(dataToUpdate, { where: criteria });
};

/**
 * function to verify a user's session.
 */
sessionService.verifySession = async (userId, accessToken) => {
    let userSession = (await MODELS.sessionModel.findOne({ where: { userId, accessToken } }).toJSON());
    if (userSession) {
        return true;
    }
    return false;
};

/**
 * function to fetch user's session.
 */
sessionService.getSession = async (criteria) => {
    return (await MODELS.sessionModel.findOne({ where: criteria })).toJSON();
};

/**
 * function to remove session of a user when user is deleted from system.
 */
sessionService.removeSession = async (criteria) => {
    return await MODELS.sessionModel.destroy({ where: criteria });
};

module.exports = sessionService;