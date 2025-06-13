
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/db';

export async function enviarAlertaGastosPendientes() {
  try {
    // Obtener configuración de correo
    const configuracion = await prisma.configuracionCorreo.findFirst({
      where: { activo: true },
    });

    if (!configuracion) {
      console.log('No hay configuración de correo activa');
      return;
    }

    // Verificar si es tiempo de enviar alerta
    const ahora = new Date();
    const ultimoEnvio = configuracion.ultimoEnvio;
    
    if (ultimoEnvio) {
      const tiempoTranscurrido = ahora.getTime() - ultimoEnvio.getTime();
      const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);
      
      if (horasTranscurridas < configuracion.frecuenciaHoras) {
        console.log('Aún no es tiempo de enviar alerta');
        return;
      }
    }

    // Obtener gastos pendientes
    const gastosPendientes = await prisma.gasto.findMany({
      where: { estado: 'PENDIENTE' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (gastosPendientes.length === 0) {
      console.log('No hay gastos pendientes');
      return;
    }

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: configuracion.servidorSmtp,
      port: configuracion.puerto,
      secure: configuracion.puerto === 465,
      auth: {
        user: configuracion.usuario,
        pass: configuracion.password,
      },
    });

    // Agrupar gastos por usuario
    const gastosPorUsuario = gastosPendientes.reduce((acc, gasto) => {
      const email = gasto.user.email;
      if (!acc[email]) {
        acc[email] = {
          usuario: gasto.user,
          gastos: [],
        };
      }
      acc[email].gastos.push(gasto);
      return acc;
    }, {} as any);

    // Enviar alertas a cada usuario
    for (const [email, data] of Object.entries(gastosPorUsuario)) {
      const { usuario, gastos } = data as any;
      
      const montoTotal = gastos.reduce((sum: number, gasto: any) => sum + gasto.monto, 0);
      
      const html = `
        <h2>Alerta de Gastos Pendientes</h2>
        <p>Hola ${usuario.name || 'Usuario'},</p>
        <p>Tienes <strong>${gastos.length}</strong> gastos pendientes por un total de <strong>€${montoTotal.toFixed(2)}</strong>:</p>
        <ul>
          ${gastos.map((gasto: any) => `
            <li>
              <strong>${gasto.descripcion}</strong> - €${gasto.monto.toFixed(2)} 
              (${new Date(gasto.fecha).toLocaleDateString('es-ES')})
            </li>
          `).join('')}
        </ul>
        <p>Te recomendamos revisar y actualizar el estado de estos gastos.</p>
        <p>Saludos,<br>Sistema de Gestión de Gastos</p>
      `;

      await transporter.sendMail({
        from: configuracion.emailRemitente,
        to: email,
        subject: `Alerta: ${gastos.length} gastos pendientes`,
        html,
      });
    }

    // Actualizar fecha de último envío
    await prisma.configuracionCorreo.update({
      where: { id: configuracion.id },
      data: { ultimoEnvio: ahora },
    });

    console.log(`Alertas enviadas a ${Object.keys(gastosPorUsuario).length} usuarios`);
  } catch (error) {
    console.error('Error al enviar alertas:', error);
  }
}
