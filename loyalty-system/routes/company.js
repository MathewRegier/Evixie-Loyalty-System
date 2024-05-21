const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
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
        let user = await Company.findOne({ email });
        let userType = 'company';
        if (!user) {
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
        const companyId = req.user.companyId;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        company.pointsPerDollar = pointsPerDollar;
        await company.save();
        res.send({ message: 'Points per dollar rate updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

// Get company details
router.get('/details', authenticateToken, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        res.send(company);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

// Get branding information
router.get('/branding', authenticateToken, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        res.send(company.branding);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

// Get leveling configuration
router.get('/leveling-config/:companyId', authenticateToken, async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        res.send(company.levelingConfig);
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

// Update company information
router.put('/update-info', authenticateToken, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { name, email } = req.body;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        company.name = name;
        company.email = email;
        await company.save();
        res.send({ message: 'Company information updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

// Update branding information
router.put('/branding', authenticateToken, async (req, res) => {
    try {
        const { logoUrl, primaryColor, secondaryColor, backgroundColor, textColor, buttonBackgroundColor, buttonTextColor } = req.body;
        const companyId = req.user.companyId;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }
        company.branding = { logoUrl, primaryColor, secondaryColor, backgroundColor, textColor, buttonBackgroundColor, buttonTextColor };
        await company.save();
        res.send({ message: 'Branding updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
});

module.exports = router;
