
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { FiltrosGastos } from '@/lib/types';

interface GastosFiltrosProps {
  filtros: FiltrosGastos;
  onFiltrosChange: (filtros: FiltrosGastos) => void;
  onLimpiarFiltros: () => void;
}

export function GastosFiltros({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
}: GastosFiltrosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleInputChange = (campo: keyof FiltrosGastos, valor: string | number) => {
    onFiltrosChange({
      ...filtros,
      [campo]: valor === '' ? undefined : valor,
    });
  };

  const tienesFiltrosActivos = Object.values(filtros).some(
    (valor) => valor !== undefined && valor !== '' && valor !== 'TODOS'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Búsqueda</span>
          </CardTitle>
          <div className="flex space-x-2">
            {tienesFiltrosActivos && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLimpiarFiltros}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {mostrarFiltros && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="descripcion"
                  placeholder="Buscar por descripción..."
                  value={filtros.descripcion || ''}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filtros.estado || 'TODOS'}
                onValueChange={(value) => handleInputChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montoMin">Monto mínimo (CLP)</Label>
              <Input
                id="montoMin"
                type="number"
                step="1"
                placeholder="0"
                value={filtros.montoMin || ''}
                onChange={(e) => handleInputChange('montoMin', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montoMax">Monto máximo (CLP)</Label>
              <Input
                id="montoMax"
                type="number"
                step="1"
                placeholder="0"
                value={filtros.montoMax || ''}
                onChange={(e) => handleInputChange('montoMax', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha desde</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={filtros.fechaInicio || ''}
                onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha hasta</Label>
              <Input
                id="fechaFin"
                type="date"
                value={filtros.fechaFin || ''}
                onChange={(e) => handleInputChange('fechaFin', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
