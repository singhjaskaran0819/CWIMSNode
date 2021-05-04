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
    ADMIN: 0,
    CUSTOMS: 1,
    OPERATOR: 2,
    "API CONSUMER": 3
}

CONSTANTS.ROLE_NATURE = {
    SYSTEM: 0,
    BUSINESS: 1
}

CONSTANTS.DECLARATION_STATUS = {
    SUBMITTED: 0,
    APPROVED: 1,
    REJECTED: 2,
    PENDING: 3,
    "RE-SUBMITTED": 4
}

CONSTANTS.SALES_TYPE = {
    WAREHOUSE_TRANSFER: 1,
    DIPLOMAT: 2,
    DUTY_PAID: 3,
    DUTY_FREE: 3,
    DUTY_FREE_FOREX: 4,
    RESIDENT_DUTY_FREE: 5,
    CHANGE_LOCATION: 6
}

CONSTANTS.DEPARTURE_PORT = {
    CP001212: 1,
    ORIGIN32: 2
}

CONSTANTS.SALES_STATUSES = {
    "Pending": 1,
    "Completed": 2
}

CONSTANTS.CURRENCY = {
    "INR": 1,
    "USD": 2,
    "EUR": 3
}

CONSTANTS.DOCUMENT_TYPES = {
    LICENSE: 1,
    PASSPORT: 2
}

// CONSTANTS.DOCUMENT_TYPES = {
//     "License": 0,
//     "Passport": 1
// }

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

CONSTANTS.LOGS_OPERATION = {
    DELETE_USER: 1,
    ITEMS_RACKED: 2,
    REJECT_DECLARATION: 3,
    APPROVE_DECLARATION: 4,
    SUBMIT_DECLARATION: 5,
    RESUBMIT_DECLARATION: 6,
    LOG_IN: 7,
    LOG_OUT: 8,
    LOGGED_OUT_DUE_TO_IDLE_STATE: 9,
    REJECT_USER: 10,
    APPROVE_USER: 11,
    SUSPEND_USER: 12,
    RESET_RACKED_ITEMS: 13,
    ADD_DECLARATION: 14,
    UPLOAD_RACKED_GOODS: 15,
    UNSUSPEND_USER: 16,
    REASSIGN_ROLE: 17,
    ADD_USER: 18,
    LOGIN_ATTEMPT_FAILED: 19,
    CHANGE_PASSWORD: 20,
    PASSWORD_RESET: 21,
    PROFILE_UPDATED: 22,
    DELETE_DECLARATION: 23,
    GROUP_ITEMS: 24,
    UNGROUP_ITEMS: 25,
    VARIANCE_REPORT_GENERATED: 26,
    UPDATE_STOCK: 27,
    REGISTER_USER: 28,
    FORGOT_PASSWORD: 29,
    VERIFY_OTP: 30,
    RESEND_OTP: 31,
    ADD_ROLE: 32,
    DELETE_ROLE: 33,
    UPDATE_ROLE: 34,
}

CONSTANTS.UPLOAD_FILE_TYPE = {
    CSV: 0,
    XSLX: 1,
    PDF: 2
}

CONSTANTS.USER_STATUS = {
    'Pending': 0,
    'Approved': 1,
    'Rejected': 2,
    'Deleted': 3,
};

CONSTANTS.INVENTORY_TYPE = {
    'Grouped': 0,
    'Item': 1,
};

CONSTANTS.NATIONALITIES = [
    "Afghan",
    "Albanian",
    "Algerian",
    "American",
    "Andorran",
    "Angolan",
    "Anguillan",
    "Argentine",
    "Armenian",
    "Australian",
    "Austrian",
    "Azerbaijani",
    "Bahamian",
    "Bahraini",
    "Bangladeshi",
    "Barbadian",
    "Belarusian",
    "Belgian",
    "Belizean",
    "Beninese",
    "Bermudian",
    "Bhutanese",
    "Bolivian",
    "Botswanan",
    "Brazilian",
    "British",
    "British Virgin Islander",
    "Bruneian",
    "Bulgarian",
    "Burkinan",
    "Burmese",
    "Burundian",
    "Cambodian",
    "Cameroonian",
    "Canadian",
    "Cape Verdean",
    "Cayman Islander",
    "Central African",
    "Chadian",
    "Chilean",
    "Chinese",
    "Citizen of Antigua and Barbuda",
    "Citizen of Bosnia and Herzegovina",
    "Citizen of Guinea-Bissau",
    "Citizen of Kiribati",
    "Citizen of Seychelles",
    "Citizen of the Dominican Republic",
    "Citizen of Vanuatu",
    "Colombian",
    "Comoran",
    "Congolese (Congo)",
    "Congolese (DRC)",
    "Cook Islander",
    "Costa Rican",
    "Croatian",
    "Cuban",
    "Cymraes",
    "Cymro",
    "Cypriot",
    "Czech",
    "Danish",
    "Djiboutian",
    "Dominican",
    "Dutch",
    "East Timorese",
    "Ecuadorean",
    "Egyptian",
    "Emirati",
    "English",
    "Equatorial Guinean",
    "Eritrean",
    "Estonian",
    "Ethiopian",
    "Faroese",
    "Fijian",
    "Filipino",
    "Finnish",
    "French",
    "Gabonese",
    "Gambian",
    "Georgian",
    "German",
    "Ghanaian",
    "Gibraltarian",
    "Greek",
    "Greenlandic",
    "Grenadian",
    "Guamanian",
    "Guatemalan",
    "Guinean",
    "Guyanese",
    "Haitian",
    "Honduran",
    "Hong Konger",
    "Hungarian",
    "Icelandic",
    "Indian",
    "Indonesian",
    "Iranian",
    "Iraqi",
    "Irish",
    "Israeli",
    "Italian",
    "Ivorian",
    "Jamaican",
    "Japanese",
    "Jordanian",
    "Kazakh",
    "Kenyan",
    "Kittitian",
    "Kosovan",
    "Kuwaiti",
    "Kyrgyz",
    "Lao",
    "Latvian",
    "Lebanese",
    "Liberian",
    "Libyan",
    "Liechtenstein citizen",
    "Lithuanian",
    "Luxembourger",
    "Macanese",
    "Macedonian",
    "Malagasy",
    "Malawian",
    "Malaysian",
    "Maldivian",
    "Malian",
    "Maltese",
    "Marshallese",
    "Martiniquais",
    "Mauritanian",
    "Mauritian",
    "Mexican",
    "Micronesian",
    "Moldovan",
    "Monegasque",
    "Mongolian",
    "Montenegrin",
    "Montserratian",
    "Moroccan",
    "Mosotho",
    "Mozambican",
    "Namibian",
    "Nauruan",
    "Nepalese",
    "New Zealander",
    "Nicaraguan",
    "Nigerian",
    "Nigerien",
    "Niuean",
    "North Korean",
    "Northern Irish",
    "Norwegian",
    "Omani",
    "Pakistani",
    "Palauan",
    "Palestinian",
    "Panamanian",
    "Papua New Guinean",
    "Paraguayan",
    "Peruvian",
    "Pitcairn Islander",
    "Polish",
    "Portuguese",
    "Prydeinig",
    "Puerto Rican",
    "Qatari",
    "Romanian",
    "Russian",
    "Rwandan",
    "Salvadorean",
    "Sammarinese",
    "Samoan",
    "Sao Tomean",
    "Saudi Arabian",
    "Scottish",
    "Senegalese",
    "Serbian",
    "Sierra Leonean",
    "Singaporean",
    "Slovak",
    "Slovenian",
    "Solomon Islander",
    "Somali",
    "South African",
    "South Korean",
    "South Sudanese",
    "Spanish",
    "Sri Lankan",
    "St Helenian",
    "St Lucian",
    "Stateless",
    "Sudanese",
    "Surinamese",
    "Swazi",
    "Swedish",
    "Swiss",
    "Syrian",
    "Taiwanese",
    "Tajik",
    "Tanzanian",
    "Thai",
    "Togolese",
    "Tongan",
    "Trinidadian",
    "Tristanian",
    "Tunisian",
    "Turkish",
    "Turkmen",
    "Turks and Caicos Islander",
    "Tuvaluan",
    "Ugandan",
    "Ukrainian",
    "Uruguayan",
    "Uzbek",
    "Vatican citizen",
    "Venezuelan",
    "Vietnamese",
    "Vincentian",
    "Wallisian",
    "Welsh",
    "Yemeni",
    "Zambian",
    "Zimbabwean"
]

CONSTANTS.ERROR_TYPES = {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    SOCKET_ERROR: 'SOCKET_ERROR',
    INVALID_MOVE: 'INVALID_MOVE'
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

CONSTANTS.VARIANCE_REPORT_STATUSES = {
    SUBMITTED: 0,
    APPROVED: 1,
    REJECTED: 2,
    UPDATED: 3,
    CANCELLED: 4
};

CONSTANTS.INVENTORY_ITEM_STATUSES = {
    'NOT FOUND': 0,
    EXISTS: 1
};

CONSTANTS.VARIANCE_REPORT_OPERATIONS = {
    ADD_ITEM: 1,
    ADD_QUANTITY: 2,
    REPLACE: 3,
    CANCEL: 4
};

CONSTANTS.STOCK_TAKE_STATUSES = {
    OPENED: 1,
    PROVISIONALLY_CLOSED: 2,
    PERMANENTLY_CLOSED: 3
};

CONSTANTS.DEFAULTS = {
    FORGOT_PASSWORD_EMAIL_TIMING: 120 // minutes
};

CONSTANTS.EMAIL_TYPES = {
    FORGOT_PASSWORD_EMAIL: 1,
    OTP_EMAIL: 2,
    REGARDING_PENDING_REQUESTS: 3,
    ACCOUNT_APPROVED: 4,
    ACCOUNT_ADDED: 5,
    ACCOUNT_REJECTED: 6,
    NEW_ROLE_ASSIGNED: 7
};

CONSTANTS.EMAIL_SUBJECTS = {
    FORGOT_PASSWORD_EMAIL: 'CWIMS: Reset your Password',
    OTP_EMAIL: 'CWIMS: Account verification',
    REGARDING_PENDING_REQUESTS: 'Users are awaiting your approval',
    ACCOUNT_APPROVED: 'Account approved',
    ACCOUNT_ADDED: 'Account added',
    ACCOUNT_REJECTED: 'Account rejected',
    NEW_ROLE_ASSIGNED: 'New role assigned'
};

CONSTANTS.EMAIL_CONTENTS = {
    FORGOT_PASSWORD_EMAIL: 'public/templates/forgot-password.html',
    OTP_EMAIL: 'public/templates/otp.html',
    REGARDING_PENDING_REQUESTS: 'public/templates/pending-requests-email.html',
    ACCOUNT_APPROVED: 'public/templates/approve-user.html',
    ACCOUNT_ADDED: 'public/templates/account-added.html',
    ACCOUNT_REJECTED: 'public/templates/account-rejected.html',
    NEW_ROLE_ASSIGNED: 'public/templates/role-assign.html'
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
