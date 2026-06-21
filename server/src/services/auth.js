import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });
  return user;
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user || !user.active) throw new ApiError(401, 'Invalid credentials');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function issueTokens(user) {
  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshTokenHash = await hashPassword(refreshToken);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();
  return { accessToken, refreshToken, user };
}

export async function rotateTokens(userId, refreshToken) {
  const user = await User.findById(userId);
  if (!user || !user.refreshTokenHash) throw new ApiError(401, 'Invalid refresh token');

  const valid = await comparePassword(refreshToken, user.refreshTokenHash);
  if (!valid) throw new ApiError(401, 'Invalid refresh token');

  return issueTokens(user);
}

export async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  return obj;
}
