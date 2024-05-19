const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pointsPerDollar: { type: Number, default: 1 }, // Default rate
  levelingConfig: {
    type: {
      auto: { type: Boolean, default: true },
      initialAmount: { type: Number, default: 100 }, // Amount for the first level-up
      manualConfig: [{ level: Number, amount: Number }] // For manual level configurations
    },
    default: { auto: true, initialAmount: 100 }
  }
});

module.exports = mongoose.model('Company', companySchema);
