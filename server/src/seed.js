import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Customer from './models/Customer.js';
import Workflow from './models/Workflow.js';
import { hashPassword } from './services/auth.js';
import { seedAgents } from './agents/seed.js';
import { ROLES } from './utils/roles.js';

async function seed() {
  await connectDB();
  await seedAgents();

  const adminExists = await User.findOne({ email: 'admin@nxtbiz.com' });
  if (!adminExists) {
    const passwordHash = await hashPassword('admin123');
    await User.create({
      name: 'Admin User',
      email: 'admin@nxtbiz.com',
      passwordHash,
      role: ROLES.ADMIN,
    });
    console.log('Created admin user: admin@nxtbiz.com / admin123');
  }

  const customerCount = await Customer.countDocuments();
  if (customerCount === 0) {
    await Customer.insertMany([
      { name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp', tags: ['enterprise'], healthScore: 82 },
      { name: 'Jane Smith', email: 'jane@startup.io', company: 'Startup.io', tags: ['startup'], healthScore: 75 },
      { name: 'Bob Wilson', email: 'bob@retail.com', company: 'Retail Plus', tags: ['retail'], healthScore: 68 },
    ]);
    console.log('Seeded sample customers');
  }

  const workflowCount = await Workflow.countDocuments();
  if (workflowCount === 0) {
    await Workflow.create({
      name: 'High Priority Support Escalation',
      trigger: 'ticket_created',
      condition: { priority: 'critical' },
      action: { createTicket: false, notify: true, notifyTitle: 'Critical Ticket', notifyMessage: 'A critical support ticket requires immediate attention' },
      enabled: true,
      logs: [],
    });
    console.log('Seeded sample workflow');
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
