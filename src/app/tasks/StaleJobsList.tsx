'use client';

import { useState } from 'react';
import LocalTime from '@/components/LocalTime';
import { cancelJob } from './actions';

interface StaleJob {
  id: number;
  name: string | null;
  started_at: Date | null;
  deployments: { id: string; title: string } | null;
}

interface StaleJobsListProps {
  jobs: StaleJob[];
}

export default function StaleJobsList({ jobs }: StaleJobsListProps) {
  const [canceling, setCanceling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingJobs, setRemainingJobs] = useState(jobs);

  const handleCancel = async (jobId: number) => {
    if (!confirm('Mark this job as failed? This cannot be undone.')) return;

    setCanceling(jobId);
    setError(null);

    try {
      await cancelJob(jobId);
      setRemainingJobs(remainingJobs.filter(j => j.id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    } finally {
      setCanceling(null);
    }
  };

  if (remainingJobs.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <header className="mb-4">
        <h2 className="text-xl font-bold text-red-900">⚠️ Stale Running Jobs</h2>
        <p className="text-red-600 text-sm">Jobs running for more than 24 hours</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-red-100 border-b border-red-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-red-900">Job Name</th>
              <th className="text-left px-4 py-3 font-medium text-red-900">Deployment</th>
              <th className="text-left px-4 py-3 font-medium text-red-900">Started</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {remainingJobs.map((job) => (
              <tr key={job.id} className="hover:bg-red-100 transition-colors">
                <td className="px-4 py-3 text-red-900 font-mono">{job.name || '—'}</td>
                <td className="px-4 py-3 text-red-700">{job.deployments?.title || '—'}</td>
                <td className="px-4 py-3 text-red-600">
                  {job.started_at ? <LocalTime date={job.started_at} /> : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleCancel(job.id)}
                    disabled={canceling === job.id}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded transition-colors"
                  >
                    {canceling === job.id ? 'Canceling...' : 'Cancel'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
