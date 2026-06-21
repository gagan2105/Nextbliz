import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['weekly', 'executive'], required: true },
    title: { type: String, required: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommendations: [{ type: String }],
    summary: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
