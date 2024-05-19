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
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
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
router.get('/company/:companyId', async (req, res) => {
  try {
      const { companyId } = req.params;
      const rewards = await Reward.find({ companyId });
      if (!rewards.length) {
          return res.status(404).send('No rewards found for this company');
      }
      res.send(rewards);
  } catch (err) {
      console.error('Error fetching rewards:', err); // Log the error for debugging
      res.status(500).send({ message: 'Failed to load rewards' });
  }
});

// Update a reward
router.put('/:rewardId', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Reward name is required'),
  body('description').optional().notEmpty().withMessage('Description is required'),
  body('pointsRequired').optional().isInt({ min: 0 }).withMessage('Points required must be a positive integer'),
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const reward = await Reward.findByIdAndUpdate(req.params.rewardId, req.body, { new: true });
    if (!reward) return res.status(404).send({ message: 'Reward not found' });
    res.send(reward);
  } catch (err) {
    console.error('Error updating reward:', err); // Log the error for debugging
    res.status(400).send({ message: 'Failed to update reward' });
  }
});

// Delete a reward
router.delete('/:rewardId', authenticateToken, async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.rewardId);
    if (!reward) return res.status(404).send({ message: 'Reward not found' });
    res.send({ message: 'Reward deleted successfully' });
  } catch (err) {
    console.error('Error deleting reward:', err); // Log the error for debugging
    res.status(400).send({ message: 'Failed to delete reward' });
  }
});

module.exports = router;
