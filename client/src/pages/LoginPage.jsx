import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@nxtbiz.com');
  const [password, setPassword] = useState('admin123');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const login = useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken);
      toast.success('Welcome back!');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-brand-600 mb-1">NxtBiz</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Sign in to your operations workspace</p>
        <form onSubmit={(e) => { e.preventDefault(); login.mutate({ email, password }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={login.isPending}>
            {login.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
