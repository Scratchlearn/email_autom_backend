const express = require('express');
const router = express.Router();
const Client = require('../models/client');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new client
router.post('/', async (req, res) => {
  const client = new Client({
    name: req.body.name,
    email: req.body.email
  });

  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
    console.log(err);
  }
});

module.exports = router;
