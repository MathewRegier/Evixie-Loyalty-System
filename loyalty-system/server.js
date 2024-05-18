const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const companyRoutes = require('./routes/company');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customer');
const rewardRoutes = require('./routes/reward'); // Include the reward routes
const customerPointsRoutes = require('./routes/customer_points');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS
const allowedOrigins = ['http://localhost:5000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', apiLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/company', companyRoutes);
app.use('/staff', staffRoutes);
app.use('/customer', customerRoutes);
app.use('/reward', rewardRoutes);
app.use('/customer_points', customerPointsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
