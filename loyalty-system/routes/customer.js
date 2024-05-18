const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/customer');
const Reward = require('../models/reward');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const router = express.Router();

// Customer login
router.post('/login', [
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { phoneNumber } = req.body;
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).send({ message: 'Customer not found' });
    }

    res.send({ customer });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

// Register customer
router.post('/register', authenticateToken, [
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('lastName').notEmpty().withMessage('Last Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid Date of Birth is required')
], async (req, res) => {
  console.log('Request Body:', req.body); // Debug log
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, phoneNumber, dateOfBirth } = req.body;
    console.log('First Name:', firstName); // Debug log
    console.log('Last Name:', lastName); // Debug log
    console.log('Email:', email); // Debug log
    console.log('Phone Number:', phoneNumber); // Debug log
    console.log('Date of Birth:', dateOfBirth); // Debug log

    const companyId = req.user.companyId; // Extract companyId from the token
    console.log('Company ID:', companyId); // Debug log

    const customer = new Customer({ companyId, firstName, lastName, email, phoneNumber, dateOfBirth });
    await customer.save();
    res.status(201).send({ message: 'Customer registered successfully', customer });
  } catch (error) {
    console.error('Error:', error); // Debug log
    res.status(400).send(error);
  }
});

// Search customers
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.query;
    const customers = await Customer.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phoneNumber: new RegExp(query, 'i') }
      ]
    });
    res.send({ customers });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add points
router.post('/points/add', authenticateToken, checkPermission('canAddPoints'), async (req, res) => {
  try {
    const { email, phoneNumber, points } = req.body;
    let customer;

    if (email) {
      customer = await Customer.findOne({ email });
    } else if (phoneNumber) {
      customer = await Customer.findOne({ phoneNumber });
    }

    if (!customer) {
      return res.status(404).send({ message: 'Customer not found' });
    }

    customer.points += points;
    await customer.save();
    res.send({ message: 'Points added successfully', points: customer.points });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get customer details
router.get('/:customerId', authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).send({ message: 'Customer not found' });
    }
    res.send({ customer });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update customer details
router.put('/:customerId', authenticateToken, checkPermission('canEditCustomer'), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('points').isInt({ min: 0 }).withMessage('Points must be a positive integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const customerId = req.params.customerId;
    const { firstName, lastName, email, phoneNumber, dateOfBirth, points } = req.body;
    const customer = await Customer.findByIdAndUpdate(customerId, { firstName, lastName, email, phoneNumber, dateOfBirth, points }, { new: true });
    if (!customer) {
      return res.status(404).send({ message: 'Customer not found' });
    }
    res.send({ message: 'Customer updated successfully', customer });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Redeem reward
router.post('/redeem', async (req, res) => {
  try {
    const { rewardId, phoneNumber } = req.body;
    const reward = await Reward.findById(rewardId);
    const customer = await Customer.findOne({ phoneNumber });

    if (!reward || !customer) {
      return res.status(404).send({ message: 'Reward or Customer not found' });
    }

    if (customer.points < reward.pointsRequired) {
      return res.status(400).send({ message: 'Not enough points to redeem this reward' });
    }

    customer.points -= reward.pointsRequired;
    await customer.save();

    res.send({ message: 'Reward redeemed successfully', customer });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Earn points
router.post('/earn', authenticateToken, async (req, res) => {
  try {
    const { customerId, amountSpent } = req.body;
    const customer = await Customer.findById(customerId);
    const company = await Company.findById(req.user.companyId);

    if (!customer || !company) {
      return res.status(404).send({ message: 'Customer or Company not found' });
    }

    const pointsEarned = amountSpent * company.pointsPerDollar;
    customer.points += pointsEarned;
    await customer.save();

    res.send({ message: 'Points earned successfully', pointsEarned });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
