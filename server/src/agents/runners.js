import CrmActivity from '../models/CrmActivity.js';
import Meeting from '../models/Meeting.js';
import Invoice from '../models/Invoice.js';
import Ticket from '../models/Ticket.js';
import Customer from '../models/Customer.js';
import { saveCustomerMemory, saveAgentMemory } from '../services/memory.js';
import { generateInvoicePdf } from '../services/pdf.js';
import { buildExecutionPlan } from './definitions.js';
import { updateAgentStatus } from './seed.js';

export async function runIntentAgent(ctx) {
  const { email, analysis } = ctx;
  return {
    sentiment: analysis.sentiment,
    intent: analysis.intent,
    urgency: analysis.urgency,
    confidence: analysis.confidence,
    autoResponse: analysis.autoResponse,
    recommendations: analysis.recommendations,
    subject: email.subject,
  };
}

export async function runTaskPlannerAgent(ctx) {
  const intent = ctx.intentOutput?.intent || ctx.analysis?.intent || 'general_inquiry';
  const plan = buildExecutionPlan(intent);
  return { intent, plan, steps: plan.map((a) => ({ agentId: a, status: 'pending' })) };
}

export async function runEmailAgent(ctx) {
  const { email, analysis, intentOutput } = ctx;
  return {
    draft: intentOutput?.autoResponse || analysis.autoResponse,
    followUpPlan: analysis.recommendations,
    urgency: analysis.urgency,
    action: 'send_follow_up',
  };
}

export async function runCrmAgent(ctx) {
  const { email, customer, userId } = ctx;
  if (!customer) {
    return { logged: false, reason: 'No matching customer' };
  }

  const activity = await CrmActivity.create({
    customerId: customer._id,
    type: 'email',
    title: `Email: ${email.subject}`,
    body: email.body.slice(0, 500),
    metadata: { emailId: email._id, intent: email.intent, sentiment: email.sentiment },
    createdBy: userId,
  });

  await saveCustomerMemory({
    customerId: customer._id,
    key: `email-${email._id}`,
    value: `${email.subject}: ${email.intent} (${email.sentiment})`,
    tags: [email.intent, email.sentiment],
    source: 'crm-agent',
    agentId: 'crm-agent',
  });

  return { logged: true, activityId: activity._id };
}

export async function runMeetingAgent(ctx) {
  const { email, customer } = ctx;
  const start = new Date();
  start.setDate(start.getDate() + 2);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(11, 0, 0, 0);

  const meeting = await Meeting.create({
    title: `Follow-up: ${email.subject}`,
    attendees: [email.sender, customer?.email].filter(Boolean),
    startTime: start,
    endTime: end,
    notes: `Auto-scheduled from email intent: ${email.intent}`,
    status: 'scheduled',
    customerId: customer?._id || null,
  });

  return { meetingId: meeting._id, startTime: start, endTime: end };
}

export async function runInvoiceAgent(ctx) {
  const { email, customer } = ctx;
  if (!customer) {
    return { created: false, reason: 'Customer not matched - manual review required', sender: email.sender };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await Invoice.create({
    customerId: customer._id,
    amount: 1500,
    dueDate,
    status: 'draft',
    lineItems: [{ description: 'Service per email request', quantity: 1, unitPrice: 1500 }],
  });

  const pdfUrl = await generateInvoicePdf(invoice, customer);
  invoice.pdfUrl = pdfUrl;
  await invoice.save();

  return { created: true, invoiceId: invoice._id, pdfUrl };
}

export async function runSupportAgent(ctx) {
  const { email, customer, analysis } = ctx;
  const priority = analysis.urgency === 'high' ? 'critical' : analysis.urgency === 'medium' ? 'high' : 'medium';

  const ticket = await Ticket.create({
    customerId: customer?._id || null,
    issue: email.subject,
    priority,
    status: 'open',
    resolution: '',
  });

  return { ticketId: ticket._id, priority };
}

export async function runChiefOfStaffAgent(ctx) {
  const outputs = ctx.agentOutputs || {};
  const recommendations = [];
  const conflicts = [];

  if (outputs['customer-support-agent'] && outputs['invoice-agent']) {
    conflicts.push('Support issue alongside payment escalation - prioritize support resolution first');
  }
  if (outputs['meeting-agent']) {
    recommendations.push('Confirm meeting attendees within 24 hours');
  }
  if (outputs['invoice-agent']?.created) {
    recommendations.push('Review draft invoice before sending to customer');
  }
  if (outputs['email-agent']) {
    recommendations.push('Review and approve email draft before sending');
  }

  recommendations.push('Update CRM with all agent outcomes');
  if (conflicts.length === 0) recommendations.push('No conflicts detected - proceed with planned actions');

  await saveAgentMemory({
    agentId: 'chief-of-staff-agent',
    key: `review-${ctx.eventId}`,
    value: recommendations.join('; '),
    tags: ['review', 'executive'],
  });

  return { conflicts, recommendations, priority: conflicts.length > 0 ? 'high' : 'normal' };
}

export const AGENT_RUNNERS = {
  'intent-agent': runIntentAgent,
  'task-planner-agent': runTaskPlannerAgent,
  'email-agent': runEmailAgent,
  'crm-agent': runCrmAgent,
  'meeting-agent': runMeetingAgent,
  'invoice-agent': runInvoiceAgent,
  'customer-support-agent': runSupportAgent,
  'chief-of-staff-agent': runChiefOfStaffAgent,
};
