
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' });
  
  // Eliminar cookie de autenticación
  response.cookies.delete('auth-token');
  
  return response;
}
