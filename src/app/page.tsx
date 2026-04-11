import Link from 'next/link';
import prisma from '@/lib/prisma';
import StatusBadge from '@/components/StatusBadge';
import { steps_status } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

import LocalTime from '@/components/LocalTime';

export default async function DeploymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const deployments = await prisma.deployments.findMany({
    where: search
      ? {
          OR: [
            { id: { contains: search } },
            { title: { contains: search } },
          ],
        }
      : {},
    include: {
      steps: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const getOverallStatus = (steps: { status: steps_status | null }[]) => {
    if (steps.some((s) => s.status === 'failed')) return 'failed';
    if (steps.some((s) => s.status === 'running')) return 'running';
    if (steps.every((s) => s.status === 'success') && steps.length > 0)
      return 'success';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Log Viewer
          </h1>
          <p className="text-zinc-500">
            View and track your deployment logs.
          </p>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <form className="relative flex-grow" action="/" method="GET">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by deployment ID..."
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-zinc-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">
                    ID
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">
                    Title
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">
                    Steps
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-600 text-right">
                    {/* Empty header for action link */}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {deployments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-500 italic"
                    >
                      No deployments found.
                    </td>
                  </tr>
                ) : (
                  deployments.map((deployment) => (
                    <tr
                      key={deployment.id}
                      className="hover:bg-zinc-50 transition-colors relative group"
                    >
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-blue-600">
                          {deployment.id.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-zinc-900">
                          {deployment.title || 'Untitled'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-900 font-medium">
                            {deployment.created_at
                              ? formatDistanceToNow(
                                  new Date(deployment.created_at),
                                  { addSuffix: true }
                                )
                              : '-'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {deployment.created_at
                              ? <LocalTime date={deployment.created_at} />
                              : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600">
                        {deployment.steps.length}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={getOverallStatus(deployment.steps)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/deployments/${deployment.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 after:absolute after:inset-0"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
