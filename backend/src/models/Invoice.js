import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
    pdfUrl: { type: String, default: '' },
    lineItems: [lineItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
