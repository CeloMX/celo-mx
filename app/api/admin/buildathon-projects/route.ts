import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.buildathonProject.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching buildathon projects:', error);
    return NextResponse.json(
      { error: 'Error al obtener los proyectos', details: error.message },
      { status: 500 }
    );
  }
}







