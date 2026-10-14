const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_email: { type: String, trim: true },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  at: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
