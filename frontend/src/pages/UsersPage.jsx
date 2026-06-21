import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data.data),
  });

  const create = useMutation({
    mutationFn: (d) => api.post('/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); setShowForm(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <StatusBadge status={r.role} /> },
    { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'completed' : 'cancelled'} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage internal team members"
        action={user?.role === 'Admin' && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>Add User</button>
        )}
      />
      {showForm && user?.role === 'Admin' && (
        <div className="card mb-6">
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="grid md:grid-cols-2 gap-4">
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {['Admin', 'Manager', 'Employee', 'Viewer'].map((r) => <option key={r}>{r}</option>)}
            </select>
            <button type="submit" className="btn-primary md:col-span-2" disabled={create.isPending}>Create User</button>
          </form>
        </div>
      )}
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
