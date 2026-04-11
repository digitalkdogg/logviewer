'use server';

import { spawn } from 'child_process';
import fs from 'fs'; // Keep original sync fs for runTask
import fsPromises from 'fs/promises'; // Import promise-based fs for async delete
import path from 'path';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

type ActionState = { message: string; type: 'error' | 'success', taskId?: number } | null;

// New action to create/update a task and write its script file
export async function createTask(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const app_name = (formData.get('app_name') as string).trim();
  const workdir = (formData.get('workdir') as string).trim();
  const steps = (formData.get('steps') as string).trim();

  if (!app_name || !workdir || !steps) {
    return { message: 'All fields are required.', type: 'error' };
  }

  const scriptPath = path.join(process.cwd(), 'scripts', `deploy_${app_name}.sh`);

  const scriptContent = [
    '#!/bin/sh',
    '',
    `cd ${process.cwd()} || exit 1`,
    '',
    `/usr/bin/python3 ${process.cwd()}/deploy.py \\`,
    `  --app ${app_name} \\`,
    `  --workdir ${workdir} \\`,
    `  --steps '${steps}'`, // NOTE: This assumes 'steps' content doesn't contain single quotes. For robustness, further escaping might be needed.
    '',
  ].join('\n');

  try {
    // Write the script file synchronously
    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

    // Upsert the DB record
    const existing = await prisma.tasks.findFirst({ where: { task_name: app_name } });
    let taskData;
    if (existing) {
      taskData = await prisma.tasks.update({
        where: { task_id: existing.task_id },
        data: { file_name: scriptPath, deployment_id: existing.deployment_id }, // Ensure deployment_id is kept if exists
      });
      return { message: `Task "${app_name}" updated successfully.`, type: 'success', taskId: taskData.task_id };
    } else {
      // Create new deployment and task
      const deploymentId = crypto.randomUUID();
      // Check if deployment already exists to avoid errors on re-creation with same app_name
      const existingDeployment = await prisma.deployments.findFirst({ where: { title: app_name } });
      if (!existingDeployment) {
        await prisma.deployments.create({ data: { id: deploymentId, title: app_name } });
      }
      
      taskData = await prisma.tasks.create({
        data: { deployment_id: existingDeployment?.id || deploymentId, task_name: app_name, file_name: scriptPath },
      });
      return { message: `Task "${app_name}" created successfully.`, type: 'success', taskId: taskData.task_id };
    }
  } catch (error: any) {
    console.error('Error creating/updating task:', error);
    return { message: `Failed to create/update task: ${error.message}`, type: 'error' };
  }
}

// The runTask action is now modified to ONLY execute a task based on provided form data
// It assumes the task already exists and its script file is correctly set up.
// If it doesn't exist, it creates a minimal task entry before running.
export async function runTask(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const app_name = (formData.get('app_name') as string).trim();
  const workdir = (formData.get('workdir') as string).trim();
  const steps = (formData.get('steps') as string).trim();

  if (!app_name || !workdir || !steps) {
    return { message: 'All fields are required for task execution.', type: 'error' };
  }

  const scriptPath = path.join(process.cwd(), 'scripts', `deploy_${app_name}.sh`);

  const scriptContent = [
    '#!/bin/sh',
    '',
    `cd ${process.cwd()} || exit 1`,
    '',
    `/usr/bin/python3 ${process.cwd()}/deploy.py \\`,
    `  --app ${app_name} \\`,
    `  --workdir ${workdir} \\`,
    `  --steps '${steps}'`, // NOTE: This assumes 'steps' content doesn't contain single quotes. For robustness, further escaping might be needed.
    '',
  ].join('\n');
  
  try {
    // Write the script file synchronously
    fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });

    // Ensure the task exists in the DB before running.
    const existing = await prisma.tasks.findFirst({ where: { task_name: app_name } });
    if (!existing) {
       console.warn(`Task "${app_name}" not found in DB, creating minimal entry before running.`);
       const deploymentId = crypto.randomUUID();
       const existingDeployment = await prisma.deployments.findFirst({ where: { title: app_name } });
       if (!existingDeployment) {
           await prisma.deployments.create({ data: { id: deploymentId, title: app_name } });
       }
       await prisma.tasks.create({
         data: { deployment_id: existingDeployment?.id || deploymentId, task_name: app_name, file_name: scriptPath },
       });
    } else {
      // Update file_name just in case it changed
      await prisma.tasks.update({
        where: { task_id: existing.task_id },
        data: { file_name: scriptPath },
      });
    }

    spawnScript(scriptPath);
    redirect('/'); // Redirect after execution is triggered
    return { message: 'Task is running...', type: 'success' }; // This line might not be reached due to redirect
  } catch (error: any) {
    console.error('Error running task:', error);
    return { message: `Failed to run task: ${error.message}`, type: 'error' };
  }
}

export async function runExistingTask(formData: FormData) {
  console.log("Entering runExistingTask server action...");
  const task_id_str = formData.get('task_id');
  console.log(`Received task_id from form: ${task_id_str}`);
  
  const task_id = Number(task_id_str);
  console.log(`Converted task_id to number: ${task_id}`);

  if (isNaN(task_id)) {
    console.error(`Invalid task_id received: ${task_id_str}. Could not convert to number.`);
    throw new Error('Invalid task ID provided.');
  }

  // Fetch task to get file_name. Assumes file_name is up-to-date.
  const task = await prisma.tasks.findUnique({ where: { task_id: task_id } }); 
  
  if (!task) {
    console.error(`Task with ID ${task_id} not found.`);
    throw new Error(`Task ${task_id} not found`);
  }
  console.log(`Found task: ${JSON.stringify(task)}`);

  // Check if script file exists. If not, try to create it.
  const scriptExists = fs.existsSync(task.file_name);
  if (!scriptExists) {
    console.warn(`Script file ${task.file_name} does not exist. Attempting to create it...`);
    
    try {
      // Try to create a minimal deployment script that will run the python deployment
      const scriptContent = [
        '#!/bin/sh',
        '',
        `cd ${process.cwd()} || exit 1`,
        '',
        `/usr/bin/python3 ${process.cwd()}/deploy.py \\`,
        `  --app ${task.task_name} \\`,
        '',
      ].join('\n');
      
      fs.writeFileSync(task.file_name, scriptContent, { mode: 0o755 });
      console.log(`Created basic script file: ${task.file_name}`);
    } catch (err) {
      console.error(`Failed to create script file: ${err}`);
    }
  }

  // Spawn the script associated with the task.
  spawnScript(task.file_name);
  redirect('/');
}

function spawnScript(scriptPath: string) {
  console.log(`Attempting to spawn script: ${scriptPath}`);
  const child = spawn('sh', [scriptPath], {
    detached: true,
    // Capture stdout and stderr for debugging
    stdio: ['ignore', 'pipe', 'pipe'], 
    cwd: process.cwd(),
  });

  child.stdout.on('data', (data) => {
    console.log(`Script stdout: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`Script stderr: ${data}`);
  });

  child.on('error', (err) => {
    console.error(`Failed to start script process: ${err}`);
  });

  child.on('close', (code, signal) => {
    console.log(`Script process exited with code ${code} and signal ${signal}`);
  });

  child.unref();
}

export async function getStaleRunningJobs() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return prisma.steps.findMany({
    where: {
      status: 'running',
      started_at: {
        lt: twentyFourHoursAgo,
      },
    },
    include: {
      deployments: true,
    },
    orderBy: { started_at: 'asc' },
  });
}

export async function deleteTask(taskId: number): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Fetch task to get file_name
    const task = await prisma.tasks.findUnique({
      where: { task_id: taskId }, // Using 'task_id' as the unique field
      select: { file_name: true }, // Only need the file_name
    });

    if (!task || !task.file_name) {
      console.error(`Task ${taskId} not found or file_name missing.`);
      return { success: false, message: 'Task not found or script file path is missing.' };
    }

    const scriptPath = task.file_name;

    // 2. Delete from database
    await prisma.tasks.delete({
      where: { task_id: taskId }, // Using 'task_id' as the unique field
    });
    console.log(`Deleted task ${taskId} from database.`);

    // 3. Delete file from file system (attempt)
    try {
      await fsPromises.unlink(scriptPath); // Use fsPromises for async unlink
      console.log(`Successfully deleted script file: ${scriptPath}`);
      return { success: true, message: 'Task and script file deleted successfully.' };
    } catch (fileError: any) {
      console.error(`Failed to delete script file ${scriptPath}:`, fileError);
      // Return success for DB delete, but indicate file deletion failed
      return { success: true, message: `Task deleted from database, but failed to delete script file: ${fileError.message}` };
    }

  } catch (dbError: any) {
    console.error('Error deleting task from database:', dbError);
    // Handle database errors
    return { success: false, message: `Failed to delete task from database: ${dbError.message}` };
  }
}

export async function cancelJob(stepId: number) {
  const result = await prisma.steps.update({
    where: { id: stepId },
    data: { status: 'failed', finished_at: new Date() },
  });
  return result;
}
