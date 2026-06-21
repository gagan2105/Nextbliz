import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.join(__dirname, '../../storage/pdfs');

function ensurePdfDir() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
}

export async function generateInvoicePdf(invoice, customer) {
  ensurePdfDir();
  const filename = `invoice-${invoice._id}-${uuidv4().slice(0, 8)}.pdf`;
  const filepath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(20).text('NxtBiz Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Customer: ${customer?.name || 'N/A'}`);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();

    if (invoice.lineItems?.length) {
      doc.text('Line Items:');
      invoice.lineItems.forEach((item) => {
        doc.text(`  - ${item.description}: ${item.quantity} x $${item.unitPrice}`);
      });
    }

    doc.end();
    stream.on('finish', () => resolve(`/pdfs/${filename}`));
    stream.on('error', reject);
  });
}

export async function generateReportPdf(report) {
  ensurePdfDir();
  const filename = `report-${report._id}-${uuidv4().slice(0, 8)}.pdf`;
  const filepath = path.join(PDF_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(20).text(report.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Type: ${report.type}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Summary:');
    doc.text(report.summary || 'No summary available.');
    doc.moveDown();

    if (report.metrics) {
      doc.text('Metrics:');
      for (const [key, value] of Object.entries(report.metrics)) {
        doc.text(`  ${key}: ${value}`);
      }
    }

    if (report.recommendations?.length) {
      doc.moveDown().text('Recommendations:');
      report.recommendations.forEach((r) => doc.text(`  - ${r}`));
    }

    doc.end();
    stream.on('finish', () => resolve(`/pdfs/${filename}`));
    stream.on('error', reject);
  });
}
