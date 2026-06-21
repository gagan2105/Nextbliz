import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    trigger: { type: String, required: true },
    condition: { type: mongoose.Schema.Types.Mixed, default: {} },
    action: { type: mongoose.Schema.Types.Mixed, default: {} },
    steps: [{ type: mongoose.Schema.Types.Mixed }],
    enabled: { type: Boolean, default: true },
    logs: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true }
);

export default mongoose.model('Workflow', workflowSchema);
