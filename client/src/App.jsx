import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { useSocket } from './hooks/useSocket';
import { useThemeStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import EmailsPage from './pages/EmailsPage';
import MeetingsPage from './pages/MeetingsPage';
import InvoicesPage from './pages/InvoicesPage';
import TicketsPage from './pages/TicketsPage';
import ReportsPage from './pages/ReportsPage';
import CrmPage from './pages/CrmPage';
import WorkflowsPage from './pages/WorkflowsPage';
import AiControlPage from './pages/AiControlPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function AppRoutes() {
  useSocket();
  const initTheme = useThemeStore((s) => s.init);
  useEffect(() => { initTheme(); }, [initTheme]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/emails" element={<EmailsPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/ai-control" element={<AiControlPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
