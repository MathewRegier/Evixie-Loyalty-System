const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  discount: { type: Number, required: true } // For discount percentage
});

module.exports = mongoose.model('Reward', rewardSchema);