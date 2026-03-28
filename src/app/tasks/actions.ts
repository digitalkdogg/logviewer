'use server';

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

type ActionState = { message: string; type: 'error' | 'success' } | null;

export async function runTask(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const app_name = (formData.get('app_name') as string).trim();
  const workdir = (formData.get('workdir') as string).trim();
  const steps = (formData.get('steps') as string).trim();

  const scriptPath = path.join(process.cwd(), 'scripts', `deploy_${app_name}.sh`);

  // Always write the latest script
  const scriptContent = [
    '#!/bin/sh',
    '',
    `cd ${process.cwd()} || exit 1`,
    '',
    `/usr/bin/python3 ${process.cwd()}/deploy.py \\`,
    `  --app ${app_name} \\`,
    `  --workdir ${workdir} \\`,
    `  --steps '${steps}'`,
    '',
  ].join('\n');
  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

  // Always upsert the DB record
  const existing = await prisma.tasks.findFirst({ where: { task_name: app_name } });
  if (existing) {
    await prisma.tasks.update({
      where: { task_id: existing.task_id },
      data: { file_name: scriptPath },
    });
  } else {
    const deploymentId = crypto.randomUUID();
    await prisma.deployments.create({ data: { id: deploymentId, title: app_name } });
    await prisma.tasks.create({
      data: { deployment_id: deploymentId, task_name: app_name, file_name: scriptPath },
    });
  }

  spawnScript(scriptPath);
  redirect('/');
}

export async function runExistingTask(formData: FormData) {
  const task_id = Number(formData.get('task_id'));
  const task = await prisma.tasks.findUnique({ where: { task_id } });
  if (!task) throw new Error(`Task ${task_id} not found`);

  spawnScript(task.file_name);
  redirect('/');
}

function spawnScript(scriptPath: string) {
  const child = spawn('sh', [scriptPath], {
    detached: true,
    stdio: 'ignore',
    cwd: process.cwd(),
  });
  child.unref();
}
