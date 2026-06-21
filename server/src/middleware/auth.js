import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const bearer = req.headers.authorization?.replace('Bearer ', '');
    const token = bearer || req.cookies?.accessToken;
    if (!token) throw new ApiError(401, 'Authentication required');

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokenHash');
    if (!user || !user.active) throw new ApiError(401, 'Invalid session');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(err);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}
