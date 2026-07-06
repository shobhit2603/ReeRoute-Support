import mongoose from 'mongoose';
import ApiError from '../utils/apiError.js';
import env from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, `Validation Error: ${messages.join(', ')}`);
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  if (!(error instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    code: error.statusCode,
    message: error.message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

export default errorHandler;
