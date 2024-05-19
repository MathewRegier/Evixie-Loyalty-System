const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const Staff = require('../models/staff');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register company
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const company = new Company({ name, email, password: hashedPassword });
        await company.save();
        res.status(201).send({ message: 'Company registered successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Company login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user is a company
        let user = await Company.findOne({ email });
        let userType = 'company';
        if (!user) {
            // If not a company, check if it's a staff
            user = await Staff.findOne({ email });
            userType = 'staff';
        }

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const tokenPayload = { id: user._id, userType };
        if (userType === 'company') {
            tokenPayload.companyId = user._id;
        } else if (userType === 'staff') {
            tokenPayload.companyId = user.companyId;
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token, userType });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update points per dollar rate
router.put('/points-per-dollar', authenticateToken, async (req, res) => {
    try {
        const { pointsPerDollar } = req.body;
        const companyId = req.user.companyId; // Extract companyId from the token

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }

        company.pointsPerDollar = pointsPerDollar;
        await company.save();

        res.send({ message: 'Points per dollar rate updated successfully' });
    } catch (error) {
        console.error('Error updating points per dollar rate:', error); // Debug log
        res.status(500).send({ message: 'Server error' });
    }
});

// Get leveling configuration
router.get('/leveling-config/:companyId', async (req, res) => {
    try {
        const company = await Company.findById(req.params.companyId);
        if (!company) return res.status(404).send('Company not found');
        res.send(company.levelingConfig);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update leveling configuration
router.put('/leveling-config', authenticateToken, async (req, res) => {
    try {
        const companyId = req.user.companyId; // Extract companyId from the token
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).send('Company not found');
        company.levelingConfig = req.body.levelingConfig;
        await company.save();
        res.send(company.levelingConfig);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
