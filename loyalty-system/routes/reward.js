const express = require('express');
const { body, validationResult } = require('express-validator');
const Reward = require('../models/reward');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create reward
router.post('/create', authenticateToken, [
  body('name').notEmpty().withMessage('Reward name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('pointsRequired').isInt({ min: 0 }).withMessage('Points required must be a positive integer'),
  body('discount').isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, pointsRequired, discount } = req.body;
    const companyId = req.user.companyId; // Extract companyId from the token

    const reward = new Reward({ companyId, name, description, pointsRequired, discount });
    await reward.save();
    res.status(201).send({ message: 'Reward created successfully', reward });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all rewards for a company
router.get('/company/:companyId', authenticateToken, async (req, res) => {
  try {
    const rewards = await Reward.find({ companyId: req.params.companyId });
    res.send(rewards);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
