import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StatusBadge from '@/components/StatusBadge';
import DurationLabel from '@/components/DurationLabel';
import LocalTime from '@/components/LocalTime';

export default async function DeploymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const deployment = await prisma.deployments.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: {
          created_at: 'asc',
        },
      },
    },
  });

  if (!deployment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                &larr; Back to Deployments
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900">
              {deployment.title || `Deployment ${deployment.id.substring(0, 8)}`}
            </h1>
            <p className="text-zinc-500 mt-1">
              {deployment.title && (
                <span className="font-mono text-zinc-400 mr-2">ID: {deployment.id.substring(0, 8)}</span>
              )}
              Started on {deployment.created_at ? <LocalTime date={deployment.created_at} /> : 'Unknown'}
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Steps</h2>
          {deployment.steps.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center text-zinc-500 italic">
              No steps found for this deployment.
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-200 ml-[-1px]"></div>
              
              <div className="space-y-6">
                {deployment.steps.map((step, index) => (
                  <div key={step.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-8 w-4 h-4 rounded-full border-2 border-white ml-[-8px] mt-1.5 z-10 ${
                      step.status === 'success' ? 'bg-green-500' :
                      step.status === 'failed' ? 'bg-red-500' :
                      step.status === 'running' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}></div>

                    <Link 
                      href={`/steps/${step.id}`}
                      className="block group"
                    >
                      <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm group-hover:shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
                              {step.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-zinc-500">
                                {step.started_at ? <LocalTime date={step.started_at} mode="toLocaleTimeString" /> : 'Pending'}
                              </span>
                              <DurationLabel 
                                durationMs={step.duration_ms} 
                                startedAt={step.started_at} 
                                finishedAt={step.finished_at} 
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge status={step.status} />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
