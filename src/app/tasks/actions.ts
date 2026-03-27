'use server';

import { spawn } from 'child_process';
import path from 'path';
import { redirect } from 'next/navigation';

export async function runTask(formData: FormData) {
  const app_name = (formData.get('app_name') as string).trim();
  const workdir = (formData.get('workdir') as string).trim();
  const steps = (formData.get('steps') as string).trim();

  const child = spawn(
    'python3',
    [
      path.join(process.cwd(), 'deploy.py'),
      '--app', app_name,
      '--workdir', workdir,
      '--steps', steps,
    ],
    { detached: true, stdio: 'ignore', cwd: process.cwd() }
  );
  child.unref();

  redirect('/');
}
