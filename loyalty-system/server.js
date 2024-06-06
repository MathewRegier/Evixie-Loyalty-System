const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const session = require('express-session');
const companyRoutes = require('./routes/company');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customer');
const rewardRoutes = require('./routes/reward');
const customerPointsRoutes = require('./routes/customer_points');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS
const allowedOrigins = ['https://170.52.111.75:5000', 'https://localhost:5000', 'https://login.evixie.com', 'https://funnel.evixie.com', 'https://<your-website-builder-domain>'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Enable credentials (cookies)
};

app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', apiLimiter);

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, sameSite: 'none' } // Secure cookies for HTTPS
}));

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

// Read SSL certificate files
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
