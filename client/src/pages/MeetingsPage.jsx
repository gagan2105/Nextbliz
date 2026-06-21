import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function MeetingsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', attendees: '', startTime: '', endTime: '', notes: '', status: 'scheduled' });

  const { data, isLoading } = useQuery({ queryKey: ['meetings'], queryFn: () => api.get('/meetings').then((r) => r.data.data) });

  const create = useMutation({
    mutationFn: (d) => api.post('/meetings', { ...d, attendees: d.attendees.split(',').map((a) => a.trim()).filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting created'); setShowForm(false); },
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'startTime', label: 'Start', render: (r) => new Date(r.startTime).toLocaleString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Meetings" action={<button className="btn-primary" onClick={() => setShowForm(!showForm)}>Add Meeting</button>} />
      {showForm && (
        <div className="card mb-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid md:grid-cols-2 gap-4">
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="input" placeholder="Attendees (comma-separated)" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
            <input className="input" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <input className="input" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            <textarea className="input md:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" className="btn-primary md:col-span-2">Create</button>
          </form>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
