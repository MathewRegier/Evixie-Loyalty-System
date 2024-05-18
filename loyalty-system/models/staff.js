const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: {
    canManageCustomers: { type: Boolean, default: false },
    canAddPoints: { type: Boolean, default: false }
    // Add other permissions as needed
  }
});

module.exports = mongoose.model('Staff', staffSchema);
