import { z } from 'zod';
import { verifyRefreshToken } from '../utils/jwt.js';
import {
  registerUser, loginUser, issueTokens, rotateTokens, logoutUser,
  setAuthCookies, clearAuthCookies, sanitizeUser,
} from '../services/auth.js';
import { ROLES } from '../utils/roles.js';
import { ApiError } from '../utils/apiError.js';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.VIEWER]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req, res) {
  const body = registerSchema.parse(req.body);
  const user = await registerUser(body);
  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.status(201).json({ success: true, data: { user: sanitizeUser(tokens.user), accessToken: tokens.accessToken } });
}

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await loginUser(email, password);
  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({ success: true, data: { user: sanitizeUser(tokens.user), accessToken: tokens.accessToken } });
}

export async function refresh(req, res) {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');

  const decoded = verifyRefreshToken(token);
  const tokens = await rotateTokens(decoded.id, token);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({ success: true, data: { user: sanitizeUser(tokens.user), accessToken: tokens.accessToken } });
}

export async function logout(req, res) {
  if (req.user) await logoutUser(req.user._id);
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req, res) {
  res.json({ success: true, data: sanitizeUser(req.user) });
}
