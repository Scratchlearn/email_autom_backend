const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: { type: String, required: true },
  body: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
