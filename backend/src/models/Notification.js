const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  channel: {
    type: String,
    enum: ['SMS', 'IVRS', 'ALERT'],
    required: true
  },
  to_name: { type: String, required: true, trim: true },
  to_phone: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['Applicant', 'VRO', 'Tahsildar', 'RDO', 'Staff'],
    required: true
  },
  text: { type: String, required: true },
  app_id: { type: String, ref: 'Grievance' },
  pgrs_no: { type: String, trim: true },
  status: {
    type: String,
    enum: ['simulated_sent', 'delivered', 'failed'],
    default: 'simulated_sent'
  },
  retry_count: { type: Number, default: 0 },
  at: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
