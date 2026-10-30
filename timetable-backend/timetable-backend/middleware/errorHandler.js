const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message: error.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for field: ${field}`;
    return res.status(400).json({ success: false, message: error.message });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.message = messages.join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
