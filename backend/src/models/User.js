const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['super_admin', 'rdo', 'tahsildar', 'vro', 'staff', 'citizen'],
    default: 'staff'
  },
  phone: { type: String, trim: true },
  designation: { type: String, trim: true },
  mandal: { type: String, trim: true },
  village: { type: String, trim: true },
  active: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('User', userSchema);
