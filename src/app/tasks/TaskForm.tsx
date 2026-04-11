'use client';

import { useActionState, useState } from 'react';
import { runTask } from './actions';

const STEPS_PLACEHOLDER = `[{"name": "git_pull", "cmd": "git pull origin main"},{"name": "docker_build", "cmd": "docker build -t myapp ."},{"name": "docker_stop", "cmd": "docker stop myapp", "ignore_error": true},{"name": "docker_rm", "cmd": "docker rm myapp", "ignore_error": true},{"name": "docker_run", "cmd": "docker run -d --name myapp -p 3000:3000 myapp"}]`;

interface FormValues {
  app_name: string;
  workdir: string;
  steps: string;
}

interface TaskFormProps {
  initialData?: FormValues;
  onSubmit?: (formData: FormData) => Promise<void>;
}

export default function TaskForm({ initialData, onSubmit }: TaskFormProps) {
  const [state, formAction, pending] = useActionState(runTask, null);
  const [formData, setFormData] = useState<FormValues>(initialData || {
    app_name: '',
    workdir: '',
    steps: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      event.preventDefault();
      const fd = new FormData(event.currentTarget);
      await onSubmit(fd);
    }
  };

  return (
    <form 
      action={onSubmit ? undefined : formAction} 
      onSubmit={onSubmit ? handleSubmit : undefined}
      className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 space-y-5"
    >
      {state?.message && (
        <div className={`text-sm px-3 py-2 rounded-lg border ${state.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">App Name</label>
          <input
            type="text"
            name="app_name"
            required
            value={formData.app_name}
            onChange={handleChange}
            placeholder="Enter app name"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Working Directory</label>
          <input
            type="text"
            name="workdir"
            required
            value={formData.workdir}
            onChange={handleChange}
            placeholder="Enter working directory"
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
          value={formData.steps}
          onChange={handleChange}
          placeholder={STEPS_PLACEHOLDER}
          className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-zinc-400 resize-y"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Executing...' : (onSubmit ? 'Run Task' : 'Insert')}
        </button>
      </div>
    </form>
  );
}
