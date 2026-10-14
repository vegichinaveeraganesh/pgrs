const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' does not have sufficient permissions`
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
