import prisma from '@/lib/prisma';
import LocalTime from '@/components/LocalTime';
import TaskForm from './TaskForm';
import RunTaskButton from './RunTaskButton';

// Page is dynamic so task list stays fresh
export const dynamic = 'force-dynamic';

async function getTasks() {
  return prisma.tasks.findMany({
    include: { deployments: true },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Tasks list */}
        <section>
          <header className="mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Tasks</h2>
            <p className="text-zinc-500 text-sm">Recent tasks linked to deployments.</p>
          </header>

          {tasks.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 text-sm text-zinc-400">
              No tasks yet.
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Task Name</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">File</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Deployment</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {tasks.map((task) => (
                    <tr key={task.task_id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-zinc-900 font-mono">{task.task_name}</td>
                      <td className="px-4 py-3 text-zinc-600 font-mono max-w-xs truncate" title={task.file_name}>{task.file_name}</td>
                      <td className="px-4 py-3 text-zinc-500">{task.deployments.title}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {task.created_at ? <LocalTime date={task.created_at} /> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <RunTaskButton taskId={task.task_id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Run Task form */}
        <section>
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Run Task</h1>
            <p className="text-zinc-500">Configure and execute a deployment pipeline.</p>
          </header>

          <TaskForm />
        </section>

      </div>
    </div>
  );
}
