import { ApiError } from '../utils/apiError.js';
import env from '../config/env.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal server error',
  };
  if (err.details) response.details = err.details;
  if (env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
}
