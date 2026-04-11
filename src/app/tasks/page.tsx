'use client';

import { useState, useEffect } from 'react';
import LocalTime from '@/components/LocalTime';
import TaskForm from './TaskForm';
import RunTaskButton from './RunTaskButton';
import StaleJobsList from './StaleJobsList';
import { getStaleRunningJobs, deleteTask } from './actions';

interface Deployment {
  title: string;
}

interface Task {
  id: number;         // API returns 'id', not 'task_id'
  task_id: number;    // keep for compatibility if API returns both
  deployment_id: string;
  task_name: string;
  file_name: string;
  created_at: Date | null;
  deployments: Deployment;
}

interface FormValues {
  app_name: string;
  workdir: string;
  steps: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    app_name: '',
    workdir: '',
    steps: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staleJobs, setStaleJobs] = useState<any[]>([]);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedStaleJobs] = await Promise.all([
          fetchTasks(),
          getStaleRunningJobs(),
        ]);
        setTasks(fetchedTasks);
        console.log('task fields:', JSON.stringify(fetchedTasks[0]));
        setStaleJobs(fetchedStaleJobs);
      } catch (err) {
        setError('Failed to load tasks and jobs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTaskClick = async (task: Task) => {
    setSelectedTaskForEdit(task);
    try {
      const taskId = task.id ?? task.task_id;
      const response = await fetch(`/api/tasks/${taskId}/details`);
      if (!response.ok) throw new Error('Failed to fetch task details');
      const details = await response.json();

      setFormValues({
        app_name: task.task_name,
        workdir: details.workdir,
        steps: details.steps,
      });
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Could not load task details. Please try again.');
      setFormValues({ app_name: '', workdir: '', steps: '' });
      setSelectedTaskForEdit(null);
    }
  };

  const handleNewTaskClick = () => {
    setSelectedTaskForEdit(null);
    setFormValues({ app_name: '', workdir: '', steps: '' });
  };

  // runTask uses redirect() internally so it cannot be called directly from a
  // client component. Submit via a plain fetch to an API route instead.
  const handleFormSubmit = async (formData: FormData) => {
    try {
      const body = {
        app_name: formData.get('app_name'),
        workdir: formData.get('workdir'),
        steps: formData.get('steps'),
      };
      const res = await fetch('/api/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (result?.type === 'success') {
        setTasks(await fetchTasks());
        handleNewTaskClick();
      } else {
        setError(result?.message || 'Failed to run task.');
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task and its script file?')) return;

    try {
      const result = await deleteTask(taskId);

      if (result.success) {
        setTasks(await fetchTasks());
        const editedId = selectedTaskForEdit?.id ?? selectedTaskForEdit?.task_id;
        if (selectedTaskForEdit && editedId === taskId) {
          handleNewTaskClick();
        }
        alert('Task deleted successfully.');
      } else {
        alert(`Error deleting task: ${result.message}`);
        setError(`Error deleting task: ${result.message}`);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('An unexpected error occurred while deleting the task.');
      setError('An unexpected error occurred.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">

        <section>
          <header className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Tasks</h2>
              <p className="text-zinc-500 text-sm">Recent tasks linked to deployments.</p>
            </div>
            <button
              onClick={handleNewTaskClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Task
            </button>
          </header>

          {tasks.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 text-sm text-zinc-400">
              No tasks yet.
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  {/* No stray whitespace nodes — each <th> is on its own line with no gaps */}
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Task Name</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">File</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Deployment</th>
                    <th className="text-left px-4 py-3 font-medium text-zinc-600">Created</th>
                    <th className="px-4 py-3" />
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {/* key uses task.id (the actual DB primary key) with task_id as fallback */}
                  {tasks.map((task) => (
                    <tr key={task.task_id ?? task.task_id} className="hover:bg-zinc-50 transition-colors">
                      <td
                        className="px-4 py-3 text-zinc-900 font-mono cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        {task.task_name}
                      </td>
                      <td
                        className="px-4 py-3 text-zinc-600 font-mono max-w-xs truncate"
                        title={task.file_name}
                      >
                        {task.file_name}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{task.deployments.title}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {task.created_at ? <LocalTime date={task.created_at} /> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <RunTaskButton taskId={task.id ?? task.task_id} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteTask(task.id ?? task.task_id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Run Task</h1>
            <p className="text-zinc-500">Configure and execute a deployment pipeline.</p>
          </header>
          <TaskForm 
            key={selectedTaskForEdit ? (selectedTaskForEdit.id ?? selectedTaskForEdit.task_id) : 'new-task'}
            initialData={formValues} 
            onSubmit={handleFormSubmit} 
          />
        </section>

        <StaleJobsList jobs={staleJobs} />

      </div>
    </div>
  );
}
