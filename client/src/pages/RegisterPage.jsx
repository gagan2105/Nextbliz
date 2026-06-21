import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const ROLES = ['Admin', 'Manager', 'Employee', 'Viewer'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const register = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success('Account created!');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-brand-600 mb-6">Create Account</h1>
        <form onSubmit={(e) => { e.preventDefault(); register.mutate(form); }} className="space-y-4">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          <select className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" className="btn-primary w-full" disabled={register.isPending}>Register</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account? <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
