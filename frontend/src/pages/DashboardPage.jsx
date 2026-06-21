import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { PageHeader, LoadingState, StatusBadge, ErrorState } from '../components/ui';

const COLORS = ['#3b82f6', '#94a3b8'];

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={error?.response?.data?.message || 'Failed to load dashboard'} />;

  const metrics = data?.metrics || {};
  const revenueStatus = (data?.revenueStatus || []).map((d) => ({ ...d, value: d.value || 0 }));
  const revenueTotal = revenueStatus.reduce((sum, d) => sum + d.value, 0);
  const pieData = revenueTotal > 0 ? revenueStatus : [{ name: 'No revenue', value: 1 }];
  const cards = [
    { label: 'Revenue', value: `$${(metrics.revenue || 0).toLocaleString()}` },
    { label: 'Customers', value: metrics.customers || 0 },
    { label: 'Meetings', value: metrics.meetings || 0 },
    { label: 'Open Tickets', value: metrics.tickets || 0 },
    { label: 'Health Score', value: `${metrics.healthScore || 0}/100` },
  ];

  return (
    <div>
      <PageHeader title="Executive Dashboard" subtitle="Real-time business operations overview" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Operations Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.operationsTrend || []}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="emails" fill="#3b82f6" name="Emails" />
              <Bar dataKey="tickets" fill="#94a3b8" name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Status</h3>
          {revenueTotal > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-16 text-center">No revenue data yet</p>
          )}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Emails</h3>
          <div className="space-y-3">
            {(data?.recentEmails || []).map((e) => (
              <div key={e._id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{e.subject}</p>
                  <p className="text-gray-500 text-xs">{e.sender}</p>
                </div>
                <StatusBadge status={String(e.intent || 'general')} />
              </div>
            ))}
            {!data?.recentEmails?.length && <p className="text-gray-500 text-sm">No emails yet</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Agent Activity</h3>
          <div className="space-y-3">
            {(data?.agentActivity || []).slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-900 dark:text-white">{a.agentId}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {!data?.agentActivity?.length && <p className="text-gray-500 text-sm">No agent activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
