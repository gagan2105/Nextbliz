import Customer from '../models/Customer.js';
import Ticket from '../models/Ticket.js';
import Invoice from '../models/Invoice.js';
import Email from '../models/Email.js';

const WEIGHTS = {
  customerSatisfaction: 0.28,
  responseTime: 0.16,
  invoiceCollection: 0.2,
  ticketResolution: 0.2,
  leadConversion: 0.16,
};

export async function calculateBusinessHealth() {
  const [customers, tickets, invoices, emails] = await Promise.all([
    Customer.find(),
    Ticket.find(),
    Invoice.find(),
    Email.find({ processed: true }),
  ]);

  const avgCustomerHealth = customers.length
    ? customers.reduce((s, c) => s + (c.healthScore || 75), 0) / customers.length
    : 75;

  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');
  const ticketResolution = tickets.length ? (resolvedTickets.length / tickets.length) * 100 : 80;

  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const invoiceCollection = invoices.length ? (paidInvoices.length / invoices.length) * 100 : 70;

  const highUrgency = emails.filter((e) => e.urgency === 'high').length;
  const responseTime = emails.length ? Math.max(0, 100 - highUrgency * 10) : 85;

  const salesEmails = emails.filter((e) => e.intent === 'sales_opportunity').length;
  const leadConversion = emails.length ? Math.min(100, (salesEmails / emails.length) * 200) : 60;

  const factors = {
    customerSatisfaction: avgCustomerHealth,
    responseTime,
    invoiceCollection,
    ticketResolution,
    leadConversion,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += (factors[key] || 0) * weight;
  }
  return Math.round(score);
}

export async function updateCustomerHealth(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) return;
  const tickets = await Ticket.find({ customerId });
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  let health = 85 - openTickets * 10;
  health = Math.max(20, Math.min(100, health));
  customer.healthScore = health;
  await customer.save();
}
