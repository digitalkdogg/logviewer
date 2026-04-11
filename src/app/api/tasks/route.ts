import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client

// Fetch tasks from the database
export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({ // Assuming your Prisma model for tasks is 'tasks'
      include: {
        deployments: true, // Assuming your Prisma relation name for deployments is 'deployments'
      },
    });

    // Map Prisma output to the expected structure for Task interface in page.tsx
    // Adjusted mapping to directly use snake_case field names assuming they exist in Prisma schema.
    const formattedTasks = tasks.map(task => ({
      task_id: task.task_id,
      deployment_id: task.deployment_id,
      task_name: task.task_name,
      file_name: task.file_name,
      created_at: task.created_at ? task.created_at.toISOString() : null,
      deployments: {
        title: task.deployments.title,
      },
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks from DB:', error);
    // Return a JSON error response with a 500 status code
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Placeholder for other potential task-related API endpoints if needed later.
// The page.tsx file also uses POST to '/api/tasks/delete' and fetches task details from '/api/tasks/[taskId]/details'.
// These would require separate route handlers. For now, we've fixed the GET /api/tasks endpoint.
