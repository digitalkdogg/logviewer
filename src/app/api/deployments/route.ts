import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    const deployments = await prisma.deployments.findMany({
      where: search ? {
        OR: [
          { id: { contains: search } },
          { title: { contains: search } },
        ],
      } : {},
      include: {
        steps: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
