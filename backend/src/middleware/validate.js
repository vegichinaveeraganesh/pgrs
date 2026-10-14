const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.parse) {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors || err.message
      });
    }
  };
};

module.exports = { validateBody };
