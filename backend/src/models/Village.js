const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mandal: { type: String, required: true, trim: true },
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  vroName: { type: String, trim: true },
  vroPhone: { type: String, trim: true },
  assignedVroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Official' }
}, {
  timestamps: true
});

villageSchema.index({ name: 1, mandal: 1 }, { unique: true });

module.exports = mongoose.model('Village', villageSchema);
