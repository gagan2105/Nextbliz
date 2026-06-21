import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { PageHeader, LoadingState, StatusBadge } from '../components/ui';

export default function CrmPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['crm'],
    queryFn: () => api.get('/crm').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="CRM" subtitle="Cross-customer interaction history" />
      <div className="card space-y-4">
        {(data || []).map((a) => (
          <div key={a._id} className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={a.type} />
                <span className="font-medium">{a.title}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{a.body}</p>
              <p className="text-xs text-gray-500 mt-1">{a.customerId?.name} · {new Date(a.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-gray-500 text-center py-8">No CRM activity yet</p>}
      </div>
    </div>
  );
}
