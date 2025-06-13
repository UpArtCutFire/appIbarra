
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener estadísticas generales
    const totalGastos = await prisma.gasto.count({
      where: { userId },
    });

    const gastosPendientes = await prisma.gasto.count({
      where: { userId, estado: 'PENDIENTE' },
    });

    const gastosPagados = await prisma.gasto.count({
      where: { userId, estado: 'PAGADO' },
    });

    const montoTotal = await prisma.gasto.aggregate({
      where: { userId },
      _sum: { monto: true },
    });

    const montoPendiente = await prisma.gasto.aggregate({
      where: { userId, estado: 'PENDIENTE' },
      _sum: { monto: true },
    });

    const montoPagado = await prisma.gasto.aggregate({
      where: { userId, estado: 'PAGADO' },
      _sum: { monto: true },
    });

    // Gastos por mes (últimos 6 meses)
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - 6);

    const gastosPorMes = await prisma.gasto.groupBy({
      by: ['fecha'],
      where: {
        userId,
        fecha: {
          gte: fechaInicio,
        },
      },
      _sum: { monto: true },
      _count: true,
    });

    // Procesar datos por mes
    const mesesData = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mes = fecha.toLocaleString('es', { month: 'long', year: 'numeric' });
      
      const gastosDelMes = gastosPorMes.filter(gasto => {
        const gastoFecha = new Date(gasto.fecha);
        return gastoFecha.getMonth() === fecha.getMonth() && 
               gastoFecha.getFullYear() === fecha.getFullYear();
      });

      const montoMes = gastosDelMes.reduce((sum, gasto) => sum + (gasto._sum.monto || 0), 0);
      const cantidadMes = gastosDelMes.reduce((sum, gasto) => sum + gasto._count, 0);

      mesesData.push({
        mes,
        monto: montoMes,
        cantidad: cantidadMes,
      });
    }

    return NextResponse.json({
      resumen: {
        totalGastos,
        gastosPendientes,
        gastosPagados,
        montoTotal: montoTotal._sum.monto || 0,
        montoPendiente: montoPendiente._sum.monto || 0,
        montoPagado: montoPagado._sum.monto || 0,
      },
      gastosPorMes: mesesData,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
