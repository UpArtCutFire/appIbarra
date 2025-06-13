
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { GastosTable } from '@/components/gastos-table';
import { GastosFiltros } from '@/components/gastos-filters';
import { GastoFormDialog } from '@/components/gasto-form-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatMontoCLP } from '@/lib/utils';
import { Plus, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { Gasto, FiltrosGastos, OrdenGastos } from '@/lib/types';

export default function DashboardPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [filtros, setFiltros] = useState<FiltrosGastos>({});
  const [orden, setOrden] = useState<OrdenGastos>({ campo: 'fecha', direccion: 'desc' });
  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, [filtros, orden]);

  const cargarDatos = async () => {
    try {
      // Cargar gastos con filtros
      const params = new URLSearchParams();
      if (filtros.descripcion) params.append('descripcion', filtros.descripcion);
      if (filtros.montoMin) params.append('montoMin', filtros.montoMin.toString());
      if (filtros.montoMax) params.append('montoMax', filtros.montoMax.toString());
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.estado && filtros.estado !== 'TODOS') params.append('estado', filtros.estado);
      params.append('ordenCampo', orden.campo);
      params.append('ordenDireccion', orden.direccion);

      const [gastosResponse, estadisticasResponse] = await Promise.all([
        fetch(`/api/gastos?${params.toString()}`),
        fetch('/api/estadisticas'),
      ]);

      if (gastosResponse.ok) {
        const gastosData = await gastosResponse.json();
        setGastos(gastosData);
      }

      if (estadisticasResponse.ok) {
        const estadisticasData = await estadisticasResponse.json();
        setEstadisticas(estadisticasData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrdenChange = (campo: OrdenGastos['campo']) => {
    setOrden(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleEditarGasto = (gasto: Gasto) => {
    setGastoSeleccionado(gasto);
    setDialogAbierto(true);
  };

  const handleEliminarGasto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/gastos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Gasto eliminado',
          description: 'El gasto ha sido eliminado exitosamente',
        });
        cargarDatos();
      } else {
        toast({
          title: 'Error',
          description: 'Error al eliminar el gasto',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    }
  };

  const handleNuevoGasto = () => {
    setGastoSeleccionado(null);
    setDialogAbierto(true);
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const formatMonto = (monto: number) => {
    return formatMontoCLP(monto);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="container mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="container mx-auto max-w-7xl p-4 space-y-6">
        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-count-up">
                  {formatMonto(estadisticas.resumen.montoTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.resumen.totalGastos} gastos registrados
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 animate-count-up">
                  {formatMonto(estadisticas.resumen.montoPendiente)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.resumen.gastosPendientes} gastos pendientes
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Pagados</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 animate-count-up">
                  {formatMonto(estadisticas.resumen.montoPagado)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {estadisticas.resumen.gastosPagados} gastos pagados
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-count-up">
                  {formatMonto(estadisticas.resumen.montoTotal / 6)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 6 meses
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <GastosFiltros
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Botón nuevo gasto */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestión de Gastos</h2>
          <Button onClick={handleNuevoGasto} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        {/* Tabla de gastos */}
        <GastosTable
          gastos={gastos}
          onEdit={handleEditarGasto}
          onDelete={handleEliminarGasto}
          orden={orden}
          onOrdenChange={handleOrdenChange}
        />

        {/* Dialog para crear/editar gastos */}
        <GastoFormDialog
          open={dialogAbierto}
          onOpenChange={setDialogAbierto}
          gasto={gastoSeleccionado}
          onSuccess={cargarDatos}
        />
      </div>
    </div>
  );
}
