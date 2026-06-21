import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: 'manual', condition: '{}', action: '{"notify": true, "notifyTitle": "Workflow Alert", "notifyMessage": "Workflow executed"}' });

  const { data, isLoading } = useQuery({ queryKey: ['workflows'], queryFn: () => api.get('/workflows').then((r) => r.data.data) });

  const create = useMutation({
    mutationFn: (d) => api.post('/workflows', { ...d, condition: JSON.parse(d.condition), action: JSON.parse(d.action), enabled: true, logs: [] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workflows'] }); toast.success('Workflow created'); setShowForm(false); },
    onError: () => toast.error('Invalid JSON in condition or action'),
  });

  const execute = useMutation({
    mutationFn: (id) => api.post(`/workflows/${id}/execute`, { priority: 'critical' }),
    onSuccess: () => { toast.success('Workflow executed'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'trigger', label: 'Trigger' },
    { key: 'enabled', label: 'Status', render: (r) => <StatusBadge status={r.enabled ? 'completed' : 'cancelled'} /> },
    { key: '_id', label: 'Actions', render: (r) => <button className="btn-secondary text-xs" onClick={() => execute.mutate(r._id)}>Execute</button> },
  ];

  return (
    <div>
      <PageHeader title="Workflows" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>New Workflow</button>} />
      {showForm && (
        <div className="card mb-6 space-y-4">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Trigger" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} />
          <textarea className="input font-mono text-xs" rows={2} placeholder="Condition JSON" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
          <textarea className="input font-mono text-xs" rows={2} placeholder="Action JSON" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} />
          <button className="btn-primary" onClick={() => create.mutate(form)}>Create Workflow</button>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
