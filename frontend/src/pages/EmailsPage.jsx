import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function EmailsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ subject: '', body: '', sender: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['emails'],
    queryFn: () => api.get('/emails').then((r) => r.data.data),
  });

  const process = useMutation({
    mutationFn: (d) => api.post('/emails/process', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emails'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Email processed — agents launched');
      setForm({ subject: '', body: '', sender: '' });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'sender', label: 'Sender' },
    { key: 'intent', label: 'Intent', render: (r) => <StatusBadge status={String(r.intent || 'general')} /> },
    { key: 'sentiment', label: 'Sentiment', render: (r) => <StatusBadge status={r.sentiment} /> },
    { key: 'urgency', label: 'Urgency', render: (r) => <StatusBadge status={r.urgency} /> },
    { key: 'processed', label: 'Status', render: (r) => <StatusBadge status={r.processed ? 'completed' : 'open'} /> },
  ];

  return (
    <div>
      <PageHeader title="Emails" subtitle="Process customer emails and launch AI agents" />
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Process Incoming Email</h3>
        <form onSubmit={(e) => { e.preventDefault(); process.mutate(form); }} className="space-y-4">
          <input className="input" placeholder="Sender email" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} required />
          <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <textarea className="input" rows={4} placeholder="Email body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          <button type="submit" className="btn-primary" disabled={process.isPending}>
            {process.isPending ? 'Processing...' : 'Process & Launch Agents'}
          </button>
        </form>
      </div>
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
