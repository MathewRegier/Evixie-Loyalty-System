const express = require('express');
const authenticateToken = require('../middleware/auth');
const Reward = require('../models/reward');
const router = express.Router();

// Create a reward
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, description, pointsRequired, discount } = req.body;
    const companyId = req.user.companyId;

    const reward = new Reward({ companyId, name, description, pointsRequired, discount });
    await reward.save();

    res.status(201).send({ message: 'Reward created successfully', reward });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get rewards for a company
router.get('/company/:companyId', authenticateToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const rewards = await Reward.find({ companyId });

    res.send(rewards);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
