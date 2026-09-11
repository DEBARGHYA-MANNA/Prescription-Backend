function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  let details = error.details;

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'A supplied identifier is invalid.';
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'An account with this email address already exists.';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed.';
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  const response = {
    success: false,
    error: {
      message,
    },
  };

  if (details) response.error.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
