import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ issue: '', priority: 'medium', status: 'open' });

  const { data, isLoading } = useQuery({ queryKey: ['tickets'], queryFn: () => api.get('/tickets').then((r) => r.data.data) });

  const create = useMutation({
    mutationFn: (d) => api.post('/tickets', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tickets'] }); toast.success('Ticket created'); setShowForm(false); },
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'issue', label: 'Issue' },
    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Support Tickets" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>New Ticket</button>} />
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
            <input className="input" placeholder="Issue" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} required />
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'medium', 'high', 'critical'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <button type="submit" className="btn-primary">Create Ticket</button>
          </form>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
