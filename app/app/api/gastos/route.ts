
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const descripcion = searchParams.get('descripcion');
    const montoMin = searchParams.get('montoMin');
    const montoMax = searchParams.get('montoMax');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const estado = searchParams.get('estado');
    const ordenCampo = searchParams.get('ordenCampo') || 'fecha';
    const ordenDireccion = searchParams.get('ordenDireccion') || 'desc';

    // Construir filtros
    const where: any = { userId };

    if (descripcion) {
      where.descripcion = {
        contains: descripcion,
        mode: 'insensitive',
      };
    }

    if (montoMin || montoMax) {
      where.monto = {};
      if (montoMin) where.monto.gte = parseFloat(montoMin);
      if (montoMax) where.monto.lte = parseFloat(montoMax);
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    if (estado && estado !== 'TODOS') {
      where.estado = estado;
    }

    // Construir ordenamiento
    const orderBy: any = {};
    orderBy[ordenCampo] = ordenDireccion;

    const gastos = await prisma.gasto.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(gastos);
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { descripcion, monto, fecha, estado } = await request.json();

    if (!descripcion || !monto || !fecha) {
      return NextResponse.json(
        { error: 'Descripción, monto y fecha son requeridos' },
        { status: 400 }
      );
    }

    const gasto = await prisma.gasto.create({
      data: {
        descripcion,
        monto: parseFloat(monto),
        fecha: new Date(fecha),
        estado: estado || 'PENDIENTE',
        userId,
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

    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
