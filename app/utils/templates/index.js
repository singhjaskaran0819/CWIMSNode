const fs = require('fs');
const path = require('path');

module.exports = {
  REGISTER_SMS: {
    content: fs.readFileSync(path.resolve(__dirname, './register_sms.hbs'), 'utf8')
  },
}