// backend/src/controllers/admin.controller.js
/**
 * Admin User Management Controller
 * Provides endpoints to list, update and delete users.
 * All routes are protected by the `authenticate` middleware (already added in routes).
 * Additional role check ensures only super_admin can perform these actions.
 */
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper to verify super admin role
function ensureSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions. Super admin required.'
    });
  }
  next();
}

/** GET /v1/admin/users */
async function getAllUsers(req, res, next) {
  try {
    await ensureSuperAdmin(req, res, async () => {});
    const users = await User.find({})
      .select('-passwordHash') // exclude password hash from response
      .lean();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

/** PUT /v1/admin/users/:id */
async function updateUser(req, res, next) {
  try {
    await ensureSuperAdmin(req, res, async () => {});
    const { id } = req.params;
    const { name, email, phone, role, active, password } = req.body;
    const update = { name, email, phone, role, active };
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      update.passwordHash = passwordHash;
    }
    const updated = await User.findByIdAndUpdate(id, update, { new: true })
      .select('-passwordHash')
      .lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/** DELETE /v1/admin/users/:id */
async function deleteUser(req, res, next) {
  try {
    await ensureSuperAdmin(req, res, async () => {});
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser
};
