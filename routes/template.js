const express = require('express');
const router = express.Router();
const Template = require('../models/template');

// Default email templates
const defaultTemplates = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to Our Service',
    body: 'Hi {{name}},\n\nThank you for joining our service. We are excited to have you with us.\n\nBest regards,\nThe Team'
  },
  {
    name: 'Password Reset',
    subject: 'Password Reset Request',
    body: 'Hi {{name}},\n\nWe received a request to reset your password. Please use the following link to reset it:\n{{resetLink}}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nThe Team'
  },
  {
    name: 'Account Verification',
    subject: 'Verify Your Email Address',
    body: 'Hi {{name}},\n\nPlease verify your email address by clicking the link below:\n{{verificationLink}}\n\nThank you for joining our service.\n\nBest regards,\nThe Team'
  }
];

// Function to initialize default templates
const initializeTemplates = async () => {
  try {
    for (const templateData of defaultTemplates) {
      const template = await Template.findOne({ name: templateData.name });
      if (!template) {
        await new Template(templateData).save();
      }
    }
    console.log('Default templates initialized');
  } catch (err) {
    console.error('Error initializing templates:', err);
  }
};

// Initialize templates when the router is loaded
initializeTemplates();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new template
router.post('/', async (req, res) => {
  const { name, subject, body } = req.body;
  console.log(req.body);
  const template = new Template({
    name,
    subject,
    body,
  });

  try {
    const newTemplate = await template.save();
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
