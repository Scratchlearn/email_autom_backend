const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Client = require('../models/client');
const Template = require('../models/template');
const ScheduledEmail = require('../models/scheduledEmail');
const SMTPSetting = require('../models/smtpSetting');
const moment = require('moment-timezone');

// Middleware to validate ObjectId
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid ObjectId' });
  }
  next();
});

const isValidCron = (cronExpression) => {
  return cron.validate(cronExpression);
};

const getCronExpression = (scheduleDate, scheduleTime, timezone, frequency, interval) => {
  const scheduleMoment = moment.tz(`${scheduleDate} ${scheduleTime}`, timezone);
  const minute = scheduleMoment.minute();
  const hour = scheduleMoment.hour();
  const day = scheduleMoment.date();
  const month = scheduleMoment.month() + 1;

  switch (frequency) {
    case 'once':
      return `${minute} ${hour} ${day} ${month} *`;
    case 'daily':
      return `${minute} ${hour} */${interval} * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${scheduleMoment.day()}/${interval}`;
    case 'monthly':
      return `${minute} ${hour} ${day} */${interval} *`;
    default:
      return null;
  }
};

router.post('/', async (req, res) => {
  const { clientId, subject, templateId, schedule, timezone, placeholders, templateContent, frequency, interval } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId) || !mongoose.Types.ObjectId.isValid(templateId)) {
    return res.status(400).json({ message: 'Invalid client or template ID' });
  }

  const validClientId = new mongoose.Types.ObjectId(clientId);
  const validTemplateId = new mongoose.Types.ObjectId(templateId);

  const [scheduleDate, scheduleTime] = schedule.split(' ');

  const cronExpression = getCronExpression(scheduleDate, scheduleTime, timezone, frequency, interval);

  if (!isValidCron(cronExpression)) {
    return res.status(400).json({ message: 'Invalid cron schedule format' });
  }

  try {
    const client = await Client.findById(validClientId);
    const template = await Template.findById(validTemplateId);

    if (!client || !template) {
      return res.status(400).json({ message: 'Client or Template not found' });
    }

    const smtpSettings = await SMTPSetting.findOne();
    if (!smtpSettings) {
      return res.status(400).json({ message: 'SMTP settings not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.pass,
      },
    });

    const compiledTemplate = templateContent.replace(/{{\s*\w+\s*}}/g, (match) => {
      const key = match.replace(/{{\s*|\s*}}/g, '');
      return placeholders[key] || '';
    });

    const mailOptions = {
      from: smtpSettings.user,
      to: client.email,
      subject: subject,
      html: compiledTemplate
    };

    const task = cron.schedule(cronExpression, () => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    });

    const scheduledEmail = new ScheduledEmail({
      clientId: validClientId,
      subject,
      templateId: validTemplateId,
      schedule: new Date(schedule),
      timezone,
      placeholders,
      templateContent,
      frequency,
      interval,
      cronExpression,
    });

    await scheduledEmail.save();

    res.json({ message: 'Email scheduled successfully', taskId: task.id });

  } catch (err) {
    console.error('Error scheduling email:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const scheduledEmails = await ScheduledEmail.find().populate('clientId').populate('templateId');
    res.json(scheduledEmails);
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/history/:id', async (req, res) => {
  try {
    const scheduledEmail = await ScheduledEmail.findById(req.params.id).populate('clientId').populate('templateId');
    if (!scheduledEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }
    res.json(scheduledEmail);
  } catch (error) {
    console.error('Error fetching scheduled email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/history/:id', async (req, res) => {
  const { subject, templateContent, schedule, timezone, frequency, interval } = req.body;
  const [scheduleDate, scheduleTime] = schedule.split(' ');

  const cronExpression = getCronExpression(scheduleDate, scheduleTime, timezone, frequency, interval);

  if (!isValidCron(cronExpression)) {
    return res.status(400).json({ message: 'Invalid cron schedule format' });
  }

  try {
    const updatedEmail = await ScheduledEmail.findById(req.params.id);
    if (!updatedEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }

    updatedEmail.subject = subject;
    updatedEmail.templateContent = templateContent;
    updatedEmail.schedule = new Date(schedule);
    updatedEmail.timezone = timezone;
    updatedEmail.frequency = frequency;
    updatedEmail.interval = interval;
    updatedEmail.cronExpression = cronExpression;

    await updatedEmail.save();

    res.json(updatedEmail);
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    const deletedEmail = await ScheduledEmail.findByIdAndDelete(req.params.id);
    if (!deletedEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }
    res.json({ message: 'Scheduled email deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
