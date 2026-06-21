import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['customer', 'agent'], required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    agentId: { type: String, default: '' },
    key: { type: String, required: true },
    value: { type: String, required: true },
    tags: [{ type: String }],
    source: { type: String, default: 'system' },
  },
  { timestamps: true }
);

memorySchema.index({ key: 'text', value: 'text', tags: 'text' });

export const CustomerMemory = mongoose.model('CustomerMemory', memorySchema, 'customer_memories');
export const AgentMemory = mongoose.model('AgentMemory', memorySchema, 'agent_memories');
