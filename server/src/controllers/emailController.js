import { z } from 'zod';
import Email from '../models/Email.js';
import Customer from '../models/Customer.js';
import CrmActivity from '../models/CrmActivity.js';
import { analyzeEmail } from '../services/intelligence.js';
import { orchestrateEvent } from '../services/orchestration.js';
import { ApiError } from '../utils/apiError.js';

const processSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  sender: z.string().email(),
});

export async function processEmail(req, res) {
  const { subject, body, sender } = processSchema.parse(req.body);
  const analysis = analyzeEmail({ subject, body });

  const customer = await Customer.findOne({ email: sender });
  const email = await Email.create({
    subject, body, sender,
    customerId: customer?._id || null,
    sentiment: analysis.sentiment,
    intent: analysis.intent,
    urgency: analysis.urgency,
    autoResponse: analysis.autoResponse,
    recommendations: analysis.recommendations,
    processed: false,
  });

  if (customer) {
    await CrmActivity.create({
      customerId: customer._id,
      type: 'email',
      title: `Incoming: ${subject}`,
      body: body.slice(0, 500),
      metadata: { emailId: email._id, intent: analysis.intent },
      createdBy: req.user._id,
    });
  }

  orchestrateEvent({ emailId: email._id, userId: req.user._id }).catch(console.error);

  res.status(201).json({ success: true, data: email });
}

export async function listEmails(req, res) {
  const emails = await Email.find().sort({ createdAt: -1 }).populate('customerId', 'name email');
  res.json({ success: true, data: emails });
}

export async function getEmail(req, res) {
  const email = await Email.findById(req.params.id).populate('customerId', 'name email');
  if (!email) throw new ApiError(404, 'Email not found');
  res.json({ success: true, data: email });
}
