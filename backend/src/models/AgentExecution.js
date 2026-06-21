import mongoose from 'mongoose';

const agentExecutionSchema = new mongoose.Schema(
  {
    agentId: { type: String, required: true },
    eventId: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    input: { type: mongoose.Schema.Types.Mixed, default: {} },
    output: { type: mongoose.Schema.Types.Mixed, default: {} },
    logs: [{ type: String }],
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AgentExecution', agentExecutionSchema);
