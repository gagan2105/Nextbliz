import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AppLayout from '../components/AppLayout';
import { LoadingState } from './ui';

function isValidUser(user) {
  return user && typeof user === 'object' && user.email && user.role;
}

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return undefined;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && user && !isValidUser(user)) {
      logout();
    }
  }, [hydrated, user, logout]);

  if (!hydrated) return <LoadingState />;

  if (!isValidUser(user)) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
