import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StatusBadge from '@/components/StatusBadge';
import DurationLabel from '@/components/DurationLabel';
import LogPanel from '@/components/LogPanel';
import LocalTime from '@/components/LocalTime';

export default async function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const step = await prisma.steps.findUnique({
    where: { id: parseInt(id) },
    include: {
      deployments: true,
      events: {
        orderBy: {
          created_at: 'asc',
        },
      },
      child_events: {
        orderBy: {
          created_at: 'asc',
        },
      },
    },
  });

  if (!step) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-zinc-200 p-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {step.deployments && (
                <Link href={`/deployments/${step.deployments.id}`} className="text-blue-600 hover:text-blue-500 text-xs font-medium">
                  &larr; Back to Deployment
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-zinc-900">
                {step.name}
              </h1>
              <StatusBadge status={step.status} />
              <DurationLabel 
                durationMs={step.duration_ms} 
                startedAt={step.started_at} 
                finishedAt={step.finished_at} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Started At</p>
              <p className="text-sm text-zinc-700 font-mono">
                {step.started_at ? <LocalTime date={step.started_at} /> : 'Pending'}
              </p>
            </div>
            {step.finished_at && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Finished At</p>
                <p className="text-sm text-zinc-700 font-mono">
                  <LocalTime date={step.finished_at} />
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 sm:p-8 overflow-hidden max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          {/* Events Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-auto pr-2">
            <section>
              <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-4">Lifecycle Events</h2>
              <div className="space-y-4">
                {step.events.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">No events recorded.</p>
                ) : (
                  step.events.map((event) => (
                    <div key={event.id} className="relative pl-6 pb-2 border-l border-zinc-200 last:border-0">
                      <div className={`absolute left-0 top-0 w-2 h-2 rounded-full ml-[-4.5px] ${
                        event.event_type === 'start' ? 'bg-blue-500' :
                        event.event_type === 'finish' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      <p className="text-xs font-bold text-zinc-700 capitalize">{event.event_type}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {event.created_at ? <LocalTime date={event.created_at} mode="toLocaleTimeString" /> : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
            
            <section className="bg-zinc-100 rounded-lg p-4 border border-zinc-200">
              <h3 className="text-xs font-bold text-zinc-700 mb-2">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Log entries:</span>
                  <span className="text-zinc-700 font-mono">{step.child_events.length}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Stdout lines:</span>
                  <span className="text-zinc-700 font-mono">
                    {step.child_events.filter(e => e.log_type === 'stdout').length}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Stderr lines:</span>
                  <span className="text-zinc-700 font-mono text-red-500">
                    {step.child_events.filter(e => e.log_type === 'stderr').length}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Logs Main Area */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0">
            <LogPanel logs={step.child_events} />
          </div>
        </div>
      </main>
    </div>
  );
}
