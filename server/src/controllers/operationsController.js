import { createCrudController } from '../utils/crudController.js';
import Meeting from '../models/Meeting.js';
import Invoice from '../models/Invoice.js';
import Ticket from '../models/Ticket.js';
import Report from '../models/Report.js';
import Customer from '../models/Customer.js';
import { generateInvoicePdf, generateReportPdf } from '../services/pdf.js';
import { calculateBusinessHealth } from '../services/health.js';
import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';

export const meetingCrud = createCrudController(Meeting);
export const ticketCrud = createCrudController(Ticket);

export async function listInvoices(req, res) {
  const invoices = await Invoice.find().sort({ createdAt: -1 }).populate('customerId', 'name email');
  res.json({ success: true, data: invoices });
}

export async function createInvoice(req, res) {
  const invoice = await Invoice.create(req.body);
  const customer = await Customer.findById(invoice.customerId);
  const pdfUrl = await generateInvoicePdf(invoice, customer);
  invoice.pdfUrl = pdfUrl;
  await invoice.save();
  res.status(201).json({ success: true, data: invoice });
}

export async function getInvoice(req, res) {
  const invoice = await Invoice.findById(req.params.id).populate('customerId', 'name email');
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, data: invoice });
}

export async function downloadInvoice(req, res) {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, data: { pdfUrl: invoice.pdfUrl } });
}

export async function updateInvoice(req, res) {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, data: invoice });
}

export async function deleteInvoice(req, res) {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  res.json({ success: true, message: 'Deleted' });
}

const reportSchema = z.object({
  type: z.enum(['weekly', 'executive']),
});

export async function generateReport(req, res) {
  const { type } = reportSchema.parse(req.body);
  const healthScore = await calculateBusinessHealth();
  const metrics = { healthScore, generatedAt: new Date().toISOString() };
  const recommendations = [
    'Focus on high-priority support tickets',
    'Follow up on overdue invoices',
    'Review sales opportunity emails',
  ];
  const title = type === 'weekly' ? 'Weekly Operations Report' : 'Executive Summary Report';
  const summary = `${title} - Business health score: ${healthScore}/100`;

  const report = await Report.create({
    type, title, metrics, recommendations, summary, generatedBy: req.user._id,
  });

  const pdfUrl = await generateReportPdf(report);
  report.pdfUrl = pdfUrl;
  await report.save();

  res.status(201).json({ success: true, data: report });
}

export async function listReports(req, res) {
  const reports = await Report.find().sort({ createdAt: -1 }).populate('generatedBy', 'name');
  res.json({ success: true, data: reports });
}

export async function getReport(req, res) {
  const report = await Report.findById(req.params.id).populate('generatedBy', 'name');
  if (!report) throw new ApiError(404, 'Report not found');
  res.json({ success: true, data: report });
}
