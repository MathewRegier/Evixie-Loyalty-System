const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  discount: { type: Number, required: true }
});

module.exports = mongoose.model('Reward', rewardSchema);
