import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_URL } from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: '', amount: '', dueDate: '' });

  const { data: invoices, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/invoices').then((r) => r.data.data) });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/customers').then((r) => r.data.data) });

  const create = useMutation({
    mutationFn: (d) => api.post('/invoices', { ...d, amount: +d.amount, lineItems: [{ description: 'Service', quantity: 1, unitPrice: +d.amount }] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created with PDF'); setShowForm(false); },
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'customerId', label: 'Customer', render: (r) => r.customerId?.name || '—' },
    { key: 'amount', label: 'Amount', render: (r) => `$${r.amount?.toLocaleString()}` },
    { key: 'dueDate', label: 'Due', render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'pdfUrl', label: 'PDF', render: (r) => r.pdfUrl ? <a href={`${API_URL}${r.pdfUrl}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Download</a> : '—' },
  ];

  return (
    <div>
      <PageHeader title="Invoices" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>Create Invoice</button>} />
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid md:grid-cols-3 gap-4">
            <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
              <option value="">Select customer</option>
              {(customers || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input className="input" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            <button type="submit" className="btn-primary md:col-span-3">Generate Invoice & PDF</button>
          </form>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={invoices} /></div>
    </div>
  );
}
