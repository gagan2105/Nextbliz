import Workflow from '../models/Workflow.js';
import Ticket from '../models/Ticket.js';
import { createNotification } from './notifications.js';

function matchesCondition(condition, payload) {
  if (!condition || Object.keys(condition).length === 0) return true;
  for (const [key, expected] of Object.entries(condition)) {
    if (payload[key] !== expected) return false;
  }
  return true;
}

export async function executeWorkflow(workflowId, payload = {}) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new Error('Workflow not found');
  if (!workflow.enabled) {
    const log = { timestamp: new Date(), status: 'skipped', reason: 'Workflow disabled', payload };
    workflow.logs.push(log);
    await workflow.save();
    return { skipped: true, reason: 'Workflow disabled' };
  }

  if (!matchesCondition(workflow.condition, payload)) {
    const log = { timestamp: new Date(), status: 'skipped', reason: 'Condition not met', payload };
    workflow.logs.push(log);
    await workflow.save();
    return { skipped: true, reason: 'Condition not met' };
  }

  const results = { actions: [] };
  const action = workflow.action || {};

  if (action.createTicket) {
    const ticket = await Ticket.create({
      issue: action.ticketIssue || `Workflow: ${workflow.name}`,
      priority: action.ticketPriority || 'medium',
      customerId: payload.customerId || null,
      status: 'open',
    });
    results.actions.push({ type: 'ticket', id: ticket._id });
  }

  if (action.notify) {
    const notification = await createNotification({
      type: 'workflow',
      title: action.notifyTitle || `Workflow: ${workflow.name}`,
      message: action.notifyMessage || 'Workflow executed successfully',
      metadata: { workflowId: workflow._id, payload },
    });
    results.actions.push({ type: 'notification', id: notification._id });
  }

  const log = { timestamp: new Date(), status: 'completed', payload, results };
  workflow.logs.push(log);
  await workflow.save();

  return { success: true, results };
}
