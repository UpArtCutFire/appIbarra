
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const configuracion = await prisma.configuracionCorreo.findFirst();

    return NextResponse.json(configuracion);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
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

    const {
      servidorSmtp,
      puerto,
      usuario,
      password,
      emailRemitente,
      frecuenciaHoras,
      activo,
    } = await request.json();

    if (!servidorSmtp || !usuario || !password || !emailRemitente) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una configuración
    const configuracionExistente = await prisma.configuracionCorreo.findFirst();

    let configuracion;

    if (configuracionExistente) {
      // Actualizar configuración existente
      configuracion = await prisma.configuracionCorreo.update({
        where: { id: configuracionExistente.id },
        data: {
          servidorSmtp,
          puerto: parseInt(puerto) || 587,
          usuario,
          password,
          emailRemitente,
          frecuenciaHoras: parseInt(frecuenciaHoras) || 24,
          activo: Boolean(activo),
        },
      });
    } else {
      // Crear nueva configuración
      configuracion = await prisma.configuracionCorreo.create({
        data: {
          servidorSmtp,
          puerto: parseInt(puerto) || 587,
          usuario,
          password,
          emailRemitente,
          frecuenciaHoras: parseInt(frecuenciaHoras) || 24,
          activo: Boolean(activo),
        },
      });
    }

    return NextResponse.json(configuracion);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
