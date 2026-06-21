import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { API_URL } from '../utils/api';
import { PageHeader, DataTable, LoadingState, StatusBadge } from '../components/ui';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['reports'], queryFn: () => api.get('/reports').then((r) => r.data.data) });

  const generate = useMutation({
    mutationFn: (type) => api.post('/reports/generate', { type }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report generated'); },
  });

  if (isLoading) return <LoadingState />;

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge status={r.type} /> },
    { key: 'summary', label: 'Summary', render: (r) => r.summary?.slice(0, 60) + '...' },
    { key: 'pdfUrl', label: 'PDF', render: (r) => r.pdfUrl ? <a href={`${API_URL}${r.pdfUrl}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Download</a> : '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => generate.mutate('weekly')} disabled={generate.isPending}>Weekly Report</button>
            <button className="btn-primary" onClick={() => generate.mutate('executive')} disabled={generate.isPending}>Executive Report</button>
          </div>
        }
      />
      <div className="card"><DataTable columns={columns} data={data} /></div>
    </div>
  );
}
