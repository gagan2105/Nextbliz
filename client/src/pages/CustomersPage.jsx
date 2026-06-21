import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', tags: '', notes: '', healthScore: 75 });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((r) => r.data.data),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/customers', { ...d, tags: d.tags ? d.tags.split(',').map((t) => t.trim()) : [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); setShowForm(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <Link to={`/customers/${r._id}`} className="text-brand-600 hover:underline">{r.name}</Link> },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company' },
    { key: 'healthScore', label: 'Health', render: (r) => <StatusBadge status={r.healthScore >= 70 ? 'completed' : r.healthScore >= 50 ? 'medium' : 'critical'} /> },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle="Manage customer database" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>Add Customer</button>} />
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid md:grid-cols-2 gap-4">
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="input" placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <input className="input" type="number" placeholder="Health Score" value={form.healthScore} onChange={(e) => setForm({ ...form, healthScore: +e.target.value })} />
            <textarea className="input md:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" className="btn-primary md:col-span-2">Create Customer</button>
          </form>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
