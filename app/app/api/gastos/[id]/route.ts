
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const gastoId = parseInt(params.id);
    const { descripcion, monto, fecha, estado } = await request.json();

    // Verificar que el gasto pertenece al usuario
    const gastoExistente = await prisma.gasto.findFirst({
      where: {
        id: gastoId,
        userId,
      },
    });

    if (!gastoExistente) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      );
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id: gastoId },
      data: {
        descripcion,
        monto: parseFloat(monto),
        fecha: new Date(fecha),
        estado,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(gastoActualizado);
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const gastoId = parseInt(params.id);

    // Verificar que el gasto pertenece al usuario
    const gastoExistente = await prisma.gasto.findFirst({
      where: {
        id: gastoId,
        userId,
      },
    });

    if (!gastoExistente) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      );
    }

    await prisma.gasto.delete({
      where: { id: gastoId },
    });

    return NextResponse.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
