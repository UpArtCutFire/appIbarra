
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Mail, Server, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfiguracionCorreo } from '@/lib/types';

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<Partial<ConfiguracionCorreo>>({
    servidorSmtp: '',
    puerto: 587,
    usuario: '',
    password: '',
    emailRemitente: '',
    frecuenciaHoras: 24,
    activo: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch('/api/configuracion-correo');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfiguracion(data);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/configuracion-correo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuracion),
      });

      if (response.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'La configuración de correo ha sido guardada exitosamente',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Error al guardar la configuración',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (campo: keyof ConfiguracionCorreo, valor: string | number | boolean) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="container mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando configuración...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">
              Configura las alertas por correo electrónico
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuración del servidor SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Configuración del Servidor SMTP</span>
              </CardTitle>
              <CardDescription>
                Configura los parámetros de conexión al servidor de correo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servidorSmtp">Servidor SMTP</Label>
                  <Input
                    id="servidorSmtp"
                    placeholder="smtp.gmail.com"
                    value={configuracion.servidorSmtp || ''}
                    onChange={(e) => handleInputChange('servidorSmtp', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="puerto">Puerto</Label>
                  <Input
                    id="puerto"
                    type="number"
                    placeholder="587"
                    value={configuracion.puerto || 587}
                    onChange={(e) => handleInputChange('puerto', parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Input
                    id="usuario"
                    type="email"
                    placeholder="tu@email.com"
                    value={configuracion.usuario || ''}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={configuracion.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Configuración de Alertas</span>
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir alertas por correo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailRemitente">Email remitente</Label>
                <Input
                  id="emailRemitente"
                  type="email"
                  placeholder="alertas@tudominio.com"
                  value={configuracion.emailRemitente || ''}
                  onChange={(e) => handleInputChange('emailRemitente', e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Email que aparecerá como remitente de las alertas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frecuenciaHoras" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Frecuencia de alertas (horas)</span>
                </Label>
                <Input
                  id="frecuenciaHoras"
                  type="number"
                  min="1"
                  max="168"
                  placeholder="24"
                  value={configuracion.frecuenciaHoras || 24}
                  onChange={(e) => handleInputChange('frecuenciaHoras', parseInt(e.target.value))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Cada cuántas horas enviar alertas de gastos pendientes (1-168 horas)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={configuracion.activo || false}
                  onCheckedChange={(checked) => handleInputChange('activo', checked)}
                />
                <Label htmlFor="activo">Activar alertas por correo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Configuración para Gmail
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Servidor SMTP: smtp.gmail.com</li>
                  <li>• Puerto: 587</li>
                  <li>• Habilita la autenticación de 2 factores</li>
                  <li>• Usa una contraseña de aplicación específica</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Seguridad
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Las credenciales se almacenan de forma segura en la base de datos. 
                  Asegúrate de usar credenciales específicas para esta aplicación.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="shadow-lg">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
