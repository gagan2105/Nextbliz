import { z } from 'zod';
import CrmActivity from '../models/CrmActivity.js';
import { ApiError } from '../utils/apiError.js';

export async function listActivities(req, res) {
  const filter = req.query.customerId ? { customerId: req.query.customerId } : {};
  const activities = await CrmActivity.find(filter)
    .sort({ createdAt: -1 })
    .populate('customerId', 'name email')
    .populate('createdBy', 'name');
  res.json({ success: true, data: activities });
}

const noteSchema = z.object({
  customerId: z.string(),
  title: z.string().min(1),
  body: z.string().optional(),
});

export async function addNote(req, res) {
  const body = noteSchema.parse(req.body);
  const activity = await CrmActivity.create({
    ...body,
    type: 'note',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: activity });
}

const activitySchema = z.object({
  customerId: z.string(),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function addActivity(req, res) {
  const body = activitySchema.parse(req.body);
  const activity = await CrmActivity.create({ ...body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: activity });
}
