import AgentExecution from '../models/AgentExecution.js';

export async function startExecution(agentId, eventId, input) {
  return AgentExecution.create({
    agentId,
    eventId,
    status: 'running',
    input,
    startedAt: new Date(),
    logs: [`Started at ${new Date().toISOString()}`],
  });
}

export async function completeExecution(execution, output, logs = []) {
  execution.status = 'completed';
  execution.output = output;
  execution.finishedAt = new Date();
  execution.logs.push(...logs, `Completed at ${new Date().toISOString()}`);
  await execution.save();
  return execution;
}

export async function failExecution(execution, error) {
  execution.status = 'failed';
  execution.error = error;
  execution.finishedAt = new Date();
  execution.logs.push(`Failed: ${error}`);
  await execution.save();
  return execution;
}
