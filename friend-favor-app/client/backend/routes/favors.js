const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/request', async (req, res) => {
  const { requester, item } = req.body;
  const user = await User.findOne({ phoneNumber: requester });
  if (user.coins >= 10) {
    user.coins -= 10;
    await user.save();
    res.status(200).json({ message: 'Favor requested successfully!' });
  } else {
    res.status(400).json({ message: 'Not enough coins' });
  }
});

module.exports = router;
