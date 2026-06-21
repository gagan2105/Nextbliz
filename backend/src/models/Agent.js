import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['idle', 'running', 'error'], default: 'idle' },
    lastExecution: { type: Date, default: null },
    logs: [{ type: String }],
    capabilities: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Agent', agentSchema);
