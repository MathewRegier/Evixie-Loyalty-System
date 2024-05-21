const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pointsPerDollar: { type: Number, default: 1 },
  levelingConfig: {
    type: {
      auto: { type: Boolean, default: true },
      initialAmount: { type: Number, default: 100 },
      manualConfig: [{ level: Number, amount: Number }]
    },
    default: { auto: true, initialAmount: 100 }
  },
  branding: {
    logoUrl: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String }
  }
});

module.exports = mongoose.model('Company', companySchema);
