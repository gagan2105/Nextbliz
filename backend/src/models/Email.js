import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sender: { type: String, required: true, lowercase: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    sentiment: { type: String, default: 'neutral' },
    intent: { type: String, default: 'general_inquiry' },
    urgency: { type: String, default: 'low' },
    autoResponse: { type: String, default: '' },
    recommendations: [{ type: String }],
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Email', emailSchema);
