import { CustomerMemory, AgentMemory } from '../models/Memory.js';

export async function searchMemory(query) {
  const searchQuery = { $text: { $search: query } };
  const [customerResults, agentResults] = await Promise.all([
    CustomerMemory.find(searchQuery).limit(20).populate('customerId', 'name email'),
    AgentMemory.find(searchQuery).limit(20),
  ]);
  return { customerMemories: customerResults, agentMemories: agentResults };
}

export async function saveCustomerMemory({ customerId, key, value, tags = [], source = 'crm-agent', agentId = '' }) {
  return CustomerMemory.create({ scope: 'customer', customerId, agentId, key, value, tags, source });
}

export async function saveAgentMemory({ agentId, key, value, tags = [], source = 'system' }) {
  return AgentMemory.create({ scope: 'agent', agentId, key, value, tags, source });
}
