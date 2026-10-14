const mongoose = require('mongoose');

const mandalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, trim: true },
  district: { type: String, default: 'Visakhapatnam' },
  division: { type: String, default: 'Bhimunipatnam (Bhimili) Revenue Division' },
  tahsildarName: { type: String, trim: true },
  tahsildarPhone: { type: String, trim: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mandal', mandalSchema);
