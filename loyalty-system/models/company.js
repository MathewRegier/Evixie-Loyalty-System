const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pointsPerDollar: { type: Number, default: 1 } // Default rate
});

module.exports = mongoose.model('Company', companySchema);
