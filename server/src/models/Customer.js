import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    healthScore: { type: Number, default: 75, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.model('Customer', customerSchema);
