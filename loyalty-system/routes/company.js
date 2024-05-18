const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/company');
const Staff = require('../models/staff');
const authenticateToken = require('../middleware/auth'); // Add this line
const router = express.Router();

// Register company
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const company = new Company({ name, email, password });
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

router.put('/points-per-dollar', authenticateToken, async (req, res) => {
    try {
        const { pointsPerDollar } = req.body;
        const company = await Company.findById(req.user.id);

        if (!company) {
            return res.status(404).send({ message: 'Company not found' });
        }

        company.pointsPerDollar = pointsPerDollar;
        await company.save();

        res.send({ message: 'Points per dollar rate updated successfully', pointsPerDollar });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
