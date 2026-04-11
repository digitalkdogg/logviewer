import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'stdout' | 'stderr' | null;

  try {
    const step = await prisma.steps.findUnique({
      where: { id: parseInt(id) },
      include: {
        events: {
          orderBy: {
            created_at: 'asc',
          },
        },
        child_events: {
          where: type ? {
            log_type: type,
          } : {},
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json(step);
  } catch (error) {
    console.error('Error fetching step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
