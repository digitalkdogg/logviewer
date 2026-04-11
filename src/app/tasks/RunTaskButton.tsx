'use client';

import { runExistingTask } from './actions';

export default function RunTaskButton({ taskId }: { taskId: number }) {
  const handleClick = () => {
    const fd = new FormData();
    fd.set('task_id', String(taskId));
    
    // Log FormData contents for debugging on the client side
    console.log('--- FormData contents before calling runExistingTask ---');
    for (const [key, value] of fd.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log('------------------------------------------------------');

    runExistingTask(fd);
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
    >
      Run
    </button>
  );
}
