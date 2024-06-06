const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  points: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 }, // New field to track total points earned (EXP)
  level: { type: Number, default: 1 },
  badges: [String],
  achievements: [String]
});

// Ensure the combination of companyId and email is unique
customerSchema.index({ companyId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);