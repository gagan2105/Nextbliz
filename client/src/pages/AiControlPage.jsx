import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function AiControlPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ subject: 'Manual agent run', body: 'Testing agent orchestration', sender: 'contact@acme.com' });

  const { data: agents, isLoading: loadingAgents } = useQuery({ queryKey: ['agents'], queryFn: () => api.get('/agents').then((r) => r.data.data) });
  const { data: executions, isLoading: loadingExec } = useQuery({ queryKey: ['agents', 'executions'], queryFn: () => api.get('/agents/executions').then((r) => r.data.data) });

  const run = useMutation({
    mutationFn: (d) => api.post('/agents/run', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agents'] }); toast.success('Agents launched'); },
  });

  if (loadingAgents || loadingExec) return <LoadingState />;

  const agentColumns = [
    { key: 'name', label: 'Agent' },
    { key: 'agentId', label: 'ID' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'capabilities', label: 'Capabilities', render: (r) => (r.capabilities || []).join(', ') },
  ];

  const execColumns = [
    { key: 'agentId', label: 'Agent' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'startedAt', label: 'Started', render: (r) => r.startedAt ? new Date(r.startedAt).toLocaleString() : '—' },
  ];

  return (
    <div>
      <PageHeader title="AI Control" subtitle="Agent status and manual orchestration" />
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Manual Agent Run</h3>
        <form onSubmit={(e) => { e.preventDefault(); run.mutate(form); }} className="grid md:grid-cols-3 gap-4">
          <input className="input" placeholder="Sender" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} />
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <input className="input" placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button type="submit" className="btn-primary md:col-span-3" disabled={run.isPending}>Run Agents</button>
        </form>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card"><h3 className="font-semibold mb-4">Agents</h3><DataTable columns={agentColumns} data={agents} /></div>
        <div className="card"><h3 className="font-semibold mb-4">Execution History</h3><DataTable columns={execColumns} data={executions} /></div>
      </div>
    </div>
  );
}
