'use strict';

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.AVAILABLE_AUTHS = {
    'ADMIN': 0,
    'API CONSUMER': 1,
    'WAREHOUSE CLERK': 2,
    'WAREHOUSE MANAGER': 3,
    'CUSTOMS CLERK': 4,
    'CUSTOMS MANAGER': 5,
    'ALL': 6
};

CONSTANTS.USER_ROLES = {
    'ADMIN': 1,
    'API CONSUMER': 2,
    'WAREHOUSE CLERK': 3,
    'WAREHOUSE MANAGER': 4,
    'CUSTOMS CLERK': 5,
    'CUSTOMS MANAGER': 6
}

CONSTANTS.ROLE_TYPE = {
    CUSTOMS: 0,
    OPERATOR: 1,
    API_CONSUMER: 2,
    ADMIN: 3
}

CONSTANTS.ROLE_NATURE = {
    SYSTEM: 0,
    BUSINESS: 1
}

CONSTANTS.ROLE_PERMISSIONS = [
    {
        roleCode: 0,
        permissions: {
            'dashboard': [],
            'declaration': [],
            'inventory': {
                'list': [],
                'grouped-item': [],
                'variance-report': []
            },
            'warehouse': [],
            'sale': {
                'create-new-sale': [],
                'list-sale': []
            },
            'standard-report': [],
            // 'risk-management': {
            //     'risk-criteria': {
            //         'risk-criteria': [],
            //         'list-of-criteria': []
            //     },
            //     'target-list': {
            //         'target-list'
            //     },
            //     'risk-report': []
            // },
            'user-management': {
                'list-of-user': [
                    'create-new-role',
                    'create-new-user',
                    // 'approve-reject-user',
                    // 'delete-user',
                    // 'suspend-user'
                ]
            },
            'appointment': []
        }
    },
    {
        roleCode: 1,
        permissions: {

        }
    },
    {
        roleCode: 2,
        permissions: {

        }
    },
    {
        roleCode: 3,
        permissions: {
            'dashboard': [],
            'declaration': [],
            'inventory': {
                'list': [],
                'grouped-item': []
            },
            'warehouse': [],
            'sale': {
                'create-new-sale': [],
                'list-sale': []
            },
            'standard-report': [],
            'user-management': [],
            'appointment': []
        }
    },
    {
        roleCode: 4,
        permissions: {

        }
    },
    {
        roleCode: 5,
        permissions: {
            'dashboard': [],
            'inventory': {
                'list': [],
                'variance-report': []
            },
            'warehouse': [],
            'user-management': [],
            // 'risk-management': []
        }
    }
]

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{6,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
    BCRYPT_SALT: 8,
    // live
    // CAPTCHA_SECRET_KEY: '6LeNBxMaAAAAABe5ASAKFVovKDLocBSlaXlCBsuK',
    // local
    CAPTCHA_SECRET_KEY: '6LepEc8ZAAAAABlOu0wdFLkEn025HYuHATFCpiMd',
    JWT_EXPIRY_TIME: '2 days',
    STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.USER_STATUS = {
    'Pending': 0,
    'Approved': 1,
    'Rejected': 2
};

CONSTANTS.INVENTORY_TYPE = {
    'Grouped': 0,
    'Item': 1,
};

CONSTANTS.ERROR_TYPES = {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SOCKET_ERROR: 'SOCKET_ERROR',
    INVALID_MOVE: 'invalidMove'
};

CONSTANTS.HTTP_REQUEST_STATUS_CODES = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    UN_AUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
    DATA_NOT_FOUND: 404
};

CONSTANTS.OTP_STATUSES = {
    OTP_EXPIRED: 0,
    INVALID_OTP: 1,
    VERIFIED: 2
};

CONSTANTS.INVENTORY_STATUSES = {
    APPROVED: 0,
    REJECTED: 1,
    PENDING: 2,
    SUBMITTED: 3
};

CONSTANTS.DEFAULTS = {
    FORGOT_PASSWORD_EMAIL_TIMING: 120 // minutes
};

CONSTANTS.EMAIL_TYPES = {
    FORGOT_PASSWORD_EMAIL: 1,
    OTP_EMAIL: 2
};

CONSTANTS.EMAIL_SUBJECTS = {
    FORGOT_PASSWORD_EMAIL: 'CWIMS: Reset your Password',
    OTP_EMAIL: 'CWIMS: Account verification'
};

CONSTANTS.EMAIL_CONTENTS = {
    FORGOT_PASSWORD_EMAIL: 'public/templates/forgot-password.html',
    OTP_EMAIL: 'public/templates/otp.html'
};

CONSTANTS.SOCKET_EVENTS = {
    DISCONNECT: 'disconnect'
};

CONSTANTS.MAX_LIMITS_OF_USERS_FOR_SINGLE_ROOM = 4;

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['csv', 'png'];

CONSTANTS.PAGINATION = {
    DEFAULT_LIMIT: 10,
    DEFAULT_NUMBER_OF_DOCUMENTS_TO_SKIP: 0
};

CONSTANTS.TEMPLATES = require('./templates');

CONSTANTS.GENDER = {
    OTHER: 0,
    MALE: 1,
    FEMALE: 2
}

module.exports = CONSTANTS;
