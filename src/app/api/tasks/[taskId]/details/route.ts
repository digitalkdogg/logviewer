import { NextResponse } from 'next/server';
import fs from 'fs';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const taskIdNum = parseInt(taskId, 10);

    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = await prisma.tasks.findUnique({
      where: { task_id: taskIdNum },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Try to parse the script file to extract workdir and steps
    let workdir = null;
    let steps = null;

    if (task.file_name && fs.existsSync(task.file_name)) {
      try {
        const scriptContent = fs.readFileSync(task.file_name, 'utf-8');
        
        // Extract --workdir value
        const workdirMatch = scriptContent.match(/--workdir\s+([^\s]+)/);
        if (workdirMatch) {
          workdir = workdirMatch[1];
        }
        
        // Extract --steps value (everything from --steps ' to the last ')
        const stepsMatch = scriptContent.match(/--steps\s+'([^']+)'$/m);
        if (stepsMatch) {
          steps = stepsMatch[1];
        }
      } catch (err) {
        console.error('Error parsing script file:', err);
      }
    }

    return NextResponse.json({
      task_id: task.task_id,
      task_name: task.task_name,
      file_name: task.file_name,
      workdir: workdir || '',
      steps: steps || '',
    });
  } catch (error) {
    console.error('Error fetching task details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task details' },
      { status: 500 }
    );
  }
}
