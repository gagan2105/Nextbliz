import Agent from '../models/Agent.js';
import { AGENT_DEFINITIONS } from './definitions.js';

export async function seedAgents() {
  for (const def of AGENT_DEFINITIONS) {
    await Agent.findOneAndUpdate(
      { agentId: def.agentId },
      { ...def, status: 'idle', logs: [] },
      { upsert: true, new: true }
    );
  }
}

export async function updateAgentStatus(agentId, status, log) {
  const agent = await Agent.findOne({ agentId });
  if (!agent) return;
  agent.status = status;
  agent.lastExecution = new Date();
  if (log) agent.logs.push(`${new Date().toISOString()}: ${log}`);
  await agent.save();
}
