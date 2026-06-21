import Customer from '../models/Customer.js';
import Email from '../models/Email.js';
import Meeting from '../models/Meeting.js';
import Invoice from '../models/Invoice.js';
import Ticket from '../models/Ticket.js';
import AgentExecution from '../models/AgentExecution.js';
import { calculateBusinessHealth } from './health.js';

export async function getDashboardData() {
  const [customers, meetings, tickets, emails, invoices, executions] = await Promise.all([
    Customer.countDocuments(),
    Meeting.countDocuments({ status: 'scheduled' }),
    Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    Email.find().sort({ createdAt: -1 }).limit(5).populate('customerId', 'name email'),
    Invoice.find(),
    AgentExecution.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const revenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const healthScore = await calculateBusinessHealth();

  const revenueStatus = [
    { name: 'Paid', value: paidRevenue },
    { name: 'Pending', value: revenue - paidRevenue },
  ];

  const operationsTrend = [
    { name: 'Mon', emails: 4, tickets: 2 },
    { name: 'Tue', emails: 6, tickets: 3 },
    { name: 'Wed', emails: 5, tickets: 1 },
    { name: 'Thu', emails: 8, tickets: 4 },
    { name: 'Fri', emails: 7, tickets: 2 },
  ];

  return {
    metrics: {
      revenue,
      customers,
      meetings,
      tickets,
      healthScore,
    },
    healthScore,
    revenueStatus,
    operationsTrend,
    recentEmails: emails,
    agentActivity: executions,
  };
}
