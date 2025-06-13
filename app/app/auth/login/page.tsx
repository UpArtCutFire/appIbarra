
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          console.log('🔄 Sesión activa detectada, redirigiendo...');
          setIsRedirecting(true);
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.log('ℹ️ No hay sesión activa');
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔄 Iniciando proceso de login...');

    try {
      console.log('📤 Enviando solicitud de login a /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Asegurar que las cookies se incluyan
      });

      console.log('📥 Respuesta recibida:', response.status, response.statusText);
      const data = await response.json();
      console.log('📄 Datos de respuesta:', data);

      if (response.ok) {
        console.log('✅ Login exitoso, mostrando toast...');
        setIsRedirecting(true);
        
        toast({
          title: 'Inicio de sesión exitoso',
          description: 'Redirigiendo al dashboard...',
        });
        
        console.log('🔄 Redirigiendo a /dashboard...');
        
        // Redirección directa al dashboard
        setTimeout(() => {
          console.log('🚀 Redirigiendo directamente al dashboard...');
          window.location.href = '/dashboard';
        }, 500);
      } else {
        console.log('❌ Error en login:', data.error);
        toast({
          title: 'Error de autenticación',
          description: data.error || 'Credenciales inválidas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('💥 Error en catch:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Proceso de login finalizado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu sistema de gestión de gastos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
              {isRedirecting ? 'Redirigiendo...' : isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
