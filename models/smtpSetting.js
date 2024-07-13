const mongoose = require('mongoose');
const SMTPSettingSchema = new mongoose.Schema({
    host: String,
    port: Number,
    user: String,
    pass: String,
  });
module.exports = mongoose.model('SMTPSetting', SMTPSettingSchema);
