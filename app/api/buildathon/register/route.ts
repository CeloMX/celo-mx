import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validación básica
    if (!data.teamName || !data.teamMembers) {
      return NextResponse.json(
        { error: 'Nombre del equipo y miembros son requeridos' },
        { status: 400 }
      );
    }

    const project = await prisma.buildathonProject.create({
      data: {
        teamName: data.teamName,
        teamMembers: data.teamMembers,
        githubRepo: data.githubRepo || null,
        karmaGapLink: data.karmaGapLink || null,
      },
    });

    return NextResponse.json({ success: true, id: project.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering project:', error);
    return NextResponse.json(
      { error: 'Error al guardar el proyecto', details: error.message },
      { status: 500 }
    );
  }
}

