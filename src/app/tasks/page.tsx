import { runTask } from './actions';
import prisma from '@/lib/prisma';
import LocalTime from '@/components/LocalTime';

// Page is dynamic so task list stays fresh
export const dynamic = 'force-dynamic';

const STEPS_PLACEHOLDER = `[{"name": "git_pull", "cmd": "git pull origin main"},{"name": "docker_build", "cmd": "docker build -t myapp ."},{"name": "docker_stop", "cmd": "docker stop myapp", "ignore_error": true},{"name": "docker_rm", "cmd": "docker rm myapp", "ignore_error": true},{"name": "docker_run", "cmd": "docker run -d --name myapp -p 3000:3000 myapp"}]`;

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
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Task Name</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">File</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Deployment</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {tasks.map((task) => (
                    <tr key={task.task_id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3 text-zinc-900 font-mono">{task.task_name}</td>
                      <td className="px-4 py-3 text-zinc-600 font-mono">{task.file_name}</td>
                      <td className="px-4 py-3 text-zinc-500">{task.deployments.title}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {task.created_at ? <LocalTime date={task.created_at} /> : '—'}
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

          <form action={runTask} className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">App Name</label>
                <input
                  type="text"
                  name="app_name"
                  required
                  placeholder="moneygoup"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Working Directory</label>
                <input
                  type="text"
                  name="workdir"
                  required
                  placeholder="/Volume1/www/moneygoup"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Steps (JSON)</label>
              <textarea
                name="steps"
                required
                rows={6}
                placeholder={STEPS_PLACEHOLDER}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400 resize-y"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Run
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
