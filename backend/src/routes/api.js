import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';
import * as users from '../controllers/userController.js';
import * as customers from '../controllers/customerController.js';
import * as emails from '../controllers/emailController.js';
import * as crm from '../controllers/crmController.js';
import * as ops from '../controllers/operationsController.js';
import * as agents from '../controllers/agentController.js';

const router = Router();

router.use(authenticate);

// Users
router.get('/users', authorize(ROLES.ADMIN, ROLES.MANAGER), asyncHandler(users.listUsers));
router.post('/users', authorize(ROLES.ADMIN), asyncHandler(users.createUser));
router.put('/users/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), asyncHandler(users.updateUser));
router.delete('/users/:id', authorize(ROLES.ADMIN), asyncHandler(users.deleteUser));

// Dashboard & Customers
router.get('/dashboard', asyncHandler(customers.getDashboard));
router.get('/customers', asyncHandler(customers.customerCrud.list));
router.get('/customers/:id', asyncHandler(customers.customerCrud.getOne));
router.post('/customers', asyncHandler(customers.customerCrud.create));
router.put('/customers/:id', asyncHandler(customers.customerCrud.update));
router.delete('/customers/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), asyncHandler(customers.customerCrud.remove));

// Emails & CRM
router.post('/emails/process', asyncHandler(emails.processEmail));
router.get('/emails', asyncHandler(emails.listEmails));
router.get('/emails/:id', asyncHandler(emails.getEmail));
router.get('/crm', asyncHandler(crm.listActivities));
router.post('/crm/note', asyncHandler(crm.addNote));
router.post('/crm/activity', asyncHandler(crm.addActivity));

// Meetings
router.get('/meetings', asyncHandler(ops.meetingCrud.list));
router.post('/meetings', asyncHandler(ops.meetingCrud.create));
router.put('/meetings/:id', asyncHandler(ops.meetingCrud.update));
router.delete('/meetings/:id', asyncHandler(ops.meetingCrud.remove));

// Invoices
router.get('/invoices', asyncHandler(ops.listInvoices));
router.post('/invoices', asyncHandler(ops.createInvoice));
router.get('/invoices/:id', asyncHandler(ops.getInvoice));
router.get('/invoices/:id/download', asyncHandler(ops.downloadInvoice));
router.put('/invoices/:id', asyncHandler(ops.updateInvoice));
router.delete('/invoices/:id', asyncHandler(ops.deleteInvoice));

// Tickets
router.get('/tickets', asyncHandler(ops.ticketCrud.list));
router.post('/tickets', asyncHandler(ops.ticketCrud.create));
router.put('/tickets/:id', asyncHandler(ops.ticketCrud.update));
router.delete('/tickets/:id', asyncHandler(ops.ticketCrud.remove));

// Reports
router.post('/reports/generate', asyncHandler(ops.generateReport));
router.get('/reports', asyncHandler(ops.listReports));
router.get('/reports/:id', asyncHandler(ops.getReport));

// Agents
router.get('/agents', asyncHandler(agents.listAgents));
router.get('/agents/executions', asyncHandler(agents.listExecutions));
router.post('/agents/run', authorize(ROLES.ADMIN, ROLES.MANAGER), asyncHandler(agents.runAgents));

// Workflows
router.get('/workflows', asyncHandler(agents.listWorkflows));
router.post('/workflows', asyncHandler(agents.createWorkflow));
router.get('/workflows/:id', asyncHandler(agents.getWorkflow));
router.put('/workflows/:id', asyncHandler(agents.updateWorkflow));
router.delete('/workflows/:id', asyncHandler(agents.deleteWorkflow));
router.post('/workflows/:id/execute', asyncHandler(agents.executeWorkflowHandler));

// Memory & Notifications
router.get('/memory/search', asyncHandler(agents.searchMemoryHandler));
router.get('/notifications', asyncHandler(agents.listNotifications));
router.put('/notifications/:id', asyncHandler(agents.updateNotification));

export default router;
