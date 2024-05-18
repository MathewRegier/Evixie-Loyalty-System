const express = require('express');
const Customer = require('../models/customer');
const router = express.Router();

// Get customer points by phone number
router.get('/check/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const customer = await Customer.findOne({ phoneNumber });

    if (!customer) {
      return res.status(404).send({ message: 'Customer not found' });
    }

    res.send({ customer });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
