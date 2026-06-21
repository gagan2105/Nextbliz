import Agent from '../models/Agent.js';
import AgentExecution from '../models/AgentExecution.js';
import Notification from '../models/Notification.js';
import Workflow from '../models/Workflow.js';
import { runManualOrchestration } from '../services/orchestration.js';
import { executeWorkflow } from '../services/workflows.js';
import { searchMemory } from '../services/memory.js';
import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';

export async function listAgents(req, res) {
  const agents = await Agent.find().sort({ name: 1 });
  res.json({ success: true, data: agents });
}

export async function listExecutions(req, res) {
  const executions = await AgentExecution.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: executions });
}

const runSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  sender: z.string().email(),
});

export async function runAgents(req, res) {
  const body = runSchema.parse(req.body);
  const result = await runManualOrchestration({ ...body, userId: req.user._id });
  res.json({ success: true, data: result });
}

export async function listWorkflows(req, res) {
  const workflows = await Workflow.find().sort({ createdAt: -1 });
  res.json({ success: true, data: workflows });
}

export async function createWorkflow(req, res) {
  const workflow = await Workflow.create(req.body);
  res.status(201).json({ success: true, data: workflow });
}

export async function getWorkflow(req, res) {
  const workflow = await Workflow.findById(req.params.id);
  if (!workflow) throw new ApiError(404, 'Workflow not found');
  res.json({ success: true, data: workflow });
}

export async function updateWorkflow(req, res) {
  const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!workflow) throw new ApiError(404, 'Workflow not found');
  res.json({ success: true, data: workflow });
}

export async function deleteWorkflow(req, res) {
  const workflow = await Workflow.findByIdAndDelete(req.params.id);
  if (!workflow) throw new ApiError(404, 'Workflow not found');
  res.json({ success: true, message: 'Deleted' });
}

export async function executeWorkflowHandler(req, res) {
  const result = await executeWorkflow(req.params.id, req.body);
  res.json({ success: true, data: result });
}

export async function searchMemoryHandler(req, res) {
  const q = req.query.q || '';
  if (!q) return res.json({ success: true, data: { customerMemories: [], agentMemories: [] } });
  const results = await searchMemory(q);
  res.json({ success: true, data: results });
}

export async function listNotifications(req, res) {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifications });
}

export async function updateNotification(req, res) {
  const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notification) throw new ApiError(404, 'Notification not found');
  res.json({ success: true, data: notification });
}
