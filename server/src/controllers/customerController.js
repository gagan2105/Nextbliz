import { createCrudController } from '../utils/crudController.js';
import Customer from '../models/Customer.js';
import { getDashboardData } from '../services/dashboard.js';

export const customerCrud = createCrudController(Customer);

export async function getDashboard(req, res) {
  const data = await getDashboardData();
  res.json({ success: true, data });
}
