'use client';

import { runExistingTask } from './actions';

export default function RunTaskButton({ taskId }: { taskId: number }) {
  return (
    <button
      onClick={() => {
        const fd = new FormData();
        fd.set('task_id', String(taskId));
        runExistingTask(fd);
      }}
      className="px-3 py-1 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
    >
      Run
    </button>
  );
}
