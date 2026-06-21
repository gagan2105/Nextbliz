import mongoose from 'mongoose';
import { ALL_ROLES } from '../utils/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ALL_ROLES, default: 'Employee' },
    refreshTokenHash: { type: String, default: null },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
