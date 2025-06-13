
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Settings, User, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  user?: {
    name?: string;
    email: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      });
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cerrar sesión',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Menu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Gestión de Gastos</h1>
              <p className="text-sm text-muted-foreground">Panel de control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{user.name || 'Usuario'}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/configuracion')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
          </Button>
        </div>
      </div>
    </header>
  );
}
