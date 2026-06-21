import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { API_URL } from '../utils/api';
import { PageHeader, LoadingState } from '../components/ui';

export default function SettingsPage() {
  const [query, setQuery] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['memory', searchQ],
    queryFn: () => api.get('/memory/search', { params: { q: searchQ } }).then((r) => r.data.data),
    enabled: Boolean(searchQ),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQ(query);
    refetch();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Runtime configuration and memory search" />
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Runtime URLs</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">API URL</dt><dd className="font-mono">{API_URL}</dd></div>
            <div><dt className="text-gray-500">Socket.IO URL</dt><dd className="font-mono">{API_URL}</dd></div>
          </dl>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Memory Search</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input className="input" placeholder="Search customer and agent memory..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>
      </div>
      {searchQ && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Customer Memory</h3>
            {isLoading ? <LoadingState /> : (
              <div className="space-y-3">
                {(data?.customerMemories || []).map((m) => (
                  <div key={m._id} className="text-sm border-b pb-2">
                    <p className="font-medium">{m.key}</p>
                    <p className="text-gray-600 dark:text-gray-400">{m.value}</p>
                  </div>
                ))}
                {!data?.customerMemories?.length && <p className="text-gray-500">No results</p>}
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Agent Memory</h3>
            {isLoading ? <LoadingState /> : (
              <div className="space-y-3">
                {(data?.agentMemories || []).map((m) => (
                  <div key={m._id} className="text-sm border-b pb-2">
                    <p className="font-medium">{m.key}</p>
                    <p className="text-gray-600 dark:text-gray-400">{m.value}</p>
                  </div>
                ))}
                {!data?.agentMemories?.length && <p className="text-gray-500">No results</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
