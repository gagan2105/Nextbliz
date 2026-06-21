import { v4 as uuidv4 } from 'uuid';
import { Queue, Worker } from 'bullmq';
import { isRedisAvailable, getRedis } from '../config/redis.js';
import { emitEvent } from '../config/socket.js';
import Email from '../models/Email.js';
import Customer from '../models/Customer.js';
import { analyzeEmail } from './intelligence.js';
import { notifyAll } from './notifications.js';
import { startExecution, completeExecution, failExecution } from '../agents/execution.js';
import { AGENT_RUNNERS } from '../agents/runners.js';
import { buildExecutionPlan } from '../agents/definitions.js';
import { updateAgentStatus } from '../agents/seed.js';

const QUEUE_NAME = 'agent-orchestration';
let queue = null;
let worker = null;

function getConnection() {
  const redis = getRedis();
  if (!redis) return null;
  return { host: redis.options.host, port: redis.options.port };
}

export function initOrchestrationQueue() {
  if (!isRedisAvailable()) {
    console.warn('Redis unavailable - orchestration will run synchronously');
    return;
  }

  const connection = getConnection();
  queue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1500 },
    },
  });

  worker = new Worker(QUEUE_NAME, async (job) => runOrchestration(job.data), { connection });
  worker.on('failed', (job, err) => console.error(`Orchestration job ${job?.id} failed:`, err.message));
  console.log('BullMQ orchestration queue initialized');
}

export async function enqueueOrchestration(payload) {
  if (queue) {
    return queue.add('orchestrate', payload);
  }
  return runOrchestration(payload);
}

export async function orchestrateEvent({ emailId, userId }) {
  const email = await Email.findById(emailId);
  if (!email) throw new Error('Email not found');

  const analysis = analyzeEmail({ subject: email.subject, body: email.body });
  email.sentiment = analysis.sentiment;
  email.intent = analysis.intent;
  email.urgency = analysis.urgency;
  email.autoResponse = analysis.autoResponse;
  email.recommendations = analysis.recommendations;

  const customer = await Customer.findOne({ email: email.sender });
  if (customer) email.customerId = customer._id;
  await email.save();

  return enqueueOrchestration({ emailId: email._id.toString(), userId, analysis });
}

async function runOrchestration({ emailId, userId, analysis }) {
  const eventId = uuidv4();
  const email = await Email.findById(emailId);
  const customer = email.customerId ? await Customer.findById(email.customerId) : null;

  const ctx = {
    eventId,
    email,
    customer,
    userId,
    analysis,
    agentOutputs: {},
  };

  const intentPlan = buildExecutionPlan(analysis.intent);
  const plan = intentPlan;

  for (const agentId of plan) {
    const runner = AGENT_RUNNERS[agentId];
    if (!runner) continue;

    const execution = await startExecution(agentId, eventId, { emailId, intent: analysis.intent });
    await updateAgentStatus(agentId, 'running', `Processing event ${eventId}`);

    try {
      if (agentId === 'intent-agent') {
        ctx.intentOutput = await runner(ctx);
        ctx.agentOutputs[agentId] = ctx.intentOutput;
      } else if (agentId === 'task-planner-agent') {
        const output = await runner(ctx);
        ctx.planOutput = output;
        ctx.agentOutputs[agentId] = output;
      } else {
        const output = await runner(ctx);
        ctx.agentOutputs[agentId] = output;
      }
      await completeExecution(execution, ctx.agentOutputs[agentId]);
      await updateAgentStatus(agentId, 'idle', 'Completed successfully');
    } catch (err) {
      await failExecution(execution, err.message);
      await updateAgentStatus(agentId, 'error', err.message);
      throw err;
    }
  }

  email.processed = true;
  await email.save();

  await notifyAll({
    type: 'agent_completed',
    title: 'Agent Orchestration Complete',
    message: `Email "${email.subject}" processed by ${plan.length} agents`,
    metadata: { emailId, eventId, intent: analysis.intent },
  });

  emitEvent('agent_completed', { emailId, eventId, intent: analysis.intent });
  emitEvent('email_processed', { emailId });

  return { eventId, agentOutputs: ctx.agentOutputs };
}

export async function runManualOrchestration({ subject, body, sender, userId }) {
  const email = await Email.create({ subject, body, sender, processed: false });
  const analysis = analyzeEmail({ subject, body });
  return enqueueOrchestration({ emailId: email._id.toString(), userId, analysis });
}
