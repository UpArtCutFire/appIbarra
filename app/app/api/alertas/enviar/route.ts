
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { enviarAlertaGastosPendientes } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await getAuthUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await enviarAlertaGastosPendientes();

    return NextResponse.json({ 
      message: 'Alertas enviadas exitosamente' 
    });
  } catch (error) {
    console.error('Error al enviar alertas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
