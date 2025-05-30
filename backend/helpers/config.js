// config.js
require('dotenv').config();

module.exports = {
  jwtSecret: process.env.SECRET_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
//   twilioAccountSID: process.env.TWILIO_ACCOUNT_SID,
//   twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
//   twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
};
