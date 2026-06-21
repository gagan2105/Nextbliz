import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, LoadingState, StatusBadge } from '../components/ui';

export default function CustomerDetailPage() {
  const { id } = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get(`/customers/${id}`).then((r) => r.data.data),
  });

  const { data: activities } = useQuery({
    queryKey: ['crm', id],
    queryFn: () => api.get('/crm', { params: { customerId: id } }).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={customer?.name} subtitle="Customer 360 View" />
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card md:col-span-1">
          <h3 className="font-semibold mb-4">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">Email</dt><dd>{customer?.email}</dd></div>
            <div><dt className="text-gray-500">Phone</dt><dd>{customer?.phone || '—'}</dd></div>
            <div><dt className="text-gray-500">Company</dt><dd>{customer?.company || '—'}</dd></div>
            <div><dt className="text-gray-500">Health Score</dt><dd>{customer?.healthScore}/100</dd></div>
            <div><dt className="text-gray-500">Tags</dt><dd className="flex gap-1 flex-wrap mt-1">{(customer?.tags || []).map((t) => <StatusBadge key={t} status="neutral">{t}</StatusBadge>)}</dd></div>
          </dl>
          {customer?.notes && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{customer.notes}</p>}
        </div>
        <div className="card md:col-span-2">
          <h3 className="font-semibold mb-4">CRM Activity Timeline</h3>
          <div className="space-y-4">
            {(activities || []).map((a) => (
              <div key={a._id} className="border-l-2 border-brand-500 pl-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.type} />
                  <span className="text-sm font-medium">{a.title}</span>
                  <span className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
                {a.body && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.body}</p>}
              </div>
            ))}
            {!activities?.length && <p className="text-gray-500 text-sm">No activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
