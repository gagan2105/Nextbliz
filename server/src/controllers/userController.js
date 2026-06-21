import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import { hashPassword, sanitizeUser } from '../services/auth.js';
import { ROLES, ALL_ROLES } from '../utils/roles.js';
import { ApiError } from '../utils/apiError.js';

export async function listUsers(req, res) {
  const users = await User.find().select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ALL_ROLES),
});

export async function createUser(req, res) {
  const body = createSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) throw new ApiError(409, 'Email already exists');
  const passwordHash = await hashPassword(body.password);
  const user = await User.create({ ...body, passwordHash });
  res.status(201).json({ success: true, data: sanitizeUser(user) });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(ALL_ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export async function updateUser(req, res) {
  const body = updateSchema.parse(req.body);
  const update = { ...body };
  if (body.password) {
    update.passwordHash = await hashPassword(body.password);
    delete update.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash -refreshTokenHash');
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
}

export async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, message: 'User deleted' });
}
