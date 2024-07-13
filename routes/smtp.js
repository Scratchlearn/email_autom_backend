const express = require('express');
const router = express.Router();
const SMTPSetting = require('../models/smtpSetting');



//const SMTPSetting = mongoose.model('SMTPSetting', SMTPSettingSchema);

router.post('/', async (req, res) => {
  const { host, port, user, pass } = req.body;

  try {
    const existingSettings = await SMTPSetting.findOne();
    if (existingSettings) {
      existingSettings.host = host;
      existingSettings.port = port;
      existingSettings.user = user;
      existingSettings.pass = pass;
      await existingSettings.save();
    } else {
      const newSettings = new SMTPSetting({ host, port, user, pass });
      console.log(newSettings);
      await newSettings.save();
    }
    res.json({ message: 'SMTP settings saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving SMTP settings', error });
  }
});

module.exports = router;
