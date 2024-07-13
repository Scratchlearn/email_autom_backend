const mongoose = require('mongoose');

const scheduledEmailSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  subject: { type: String, required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  schedule: { type: Date, required: true },
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], required: true },
  interval: { type: Number, default: 1 }, // Interval in days/weeks/months
  placeholders: { type: Map, of: String },
  templateContent: { type: String, required: true },
});

const ScheduledEmail = mongoose.model('ScheduledEmail', scheduledEmailSchema);

module.exports = ScheduledEmail;
