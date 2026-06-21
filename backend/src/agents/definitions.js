export const AGENT_DEFINITIONS = [
  { agentId: 'intent-agent', name: 'Intent Agent', capabilities: ['sentiment', 'intent', 'urgency'] },
  { agentId: 'task-planner-agent', name: 'Task Planner Agent', capabilities: ['planning', 'routing'] },
  { agentId: 'email-agent', name: 'Email Agent', capabilities: ['drafting', 'follow-up'] },
  { agentId: 'crm-agent', name: 'CRM Agent', capabilities: ['logging', 'memory'] },
  { agentId: 'meeting-agent', name: 'Meeting Agent', capabilities: ['scheduling'] },
  { agentId: 'invoice-agent', name: 'Invoice Agent', capabilities: ['billing'] },
  { agentId: 'customer-support-agent', name: 'Customer Support Agent', capabilities: ['ticketing'] },
  { agentId: 'chief-of-staff-agent', name: 'Chief Of Staff Agent', capabilities: ['prioritization', 'review'] },
];

const INTENT_ROUTES = {
  schedule_meeting: ['meeting-agent'],
  invoice_request: ['invoice-agent'],
  support_request: ['customer-support-agent'],
  sales_opportunity: ['email-agent'],
  general_inquiry: [],
};

const ALWAYS_RUN = ['intent-agent', 'task-planner-agent', 'crm-agent', 'chief-of-staff-agent'];

export function buildExecutionPlan(intent) {
  const domainAgents = INTENT_ROUTES[intent] || [];
  const plan = [...new Set([...ALWAYS_RUN.slice(0, 2), ...domainAgents, ...ALWAYS_RUN.slice(2)])];
  return plan;
}
