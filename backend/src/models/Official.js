const mongoose = require('mongoose');

const officialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['RDO', 'Tahsildar', 'VRO'],
    required: true
  },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  mandal: { type: String, trim: true },
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  village: { type: String, trim: true },
  assignedVillages: [{ type: String, trim: true }],
  active: { type: Boolean, default: true },
  totalCount: { type: Number, default: 0 },
  pendingCount: { type: Number, default: 0 },
  resolvedCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

officialSchema.index({ phone: 1 });
officialSchema.index({ role: 1, mandal: 1 });

module.exports = mongoose.model('Official', officialSchema);
