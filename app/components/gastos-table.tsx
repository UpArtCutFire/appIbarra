
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMontoCLP } from '@/lib/utils';
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Gasto, OrdenGastos } from '@/lib/types';

interface GastosTableProps {
  gastos: Gasto[];
  onEdit: (gasto: Gasto) => void;
  onDelete: (id: number) => void;
  orden: OrdenGastos;
  onOrdenChange: (campo: OrdenGastos['campo']) => void;
}

export function GastosTable({
  gastos,
  onEdit,
  onDelete,
  orden,
  onOrdenChange,
}: GastosTableProps) {
  const getOrdenIcon = (campo: OrdenGastos['campo']) => {
    if (orden.campo !== campo) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return orden.direccion === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const formatMonto = (monto: number) => {
    return formatMontoCLP(monto);
  };

  if (gastos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No hay gastos registrados</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando tu primer gasto
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Gastos ({gastos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onOrdenChange('descripcion')}
                    className="h-auto p-0 font-medium"
                  >
                    Descripción
                    {getOrdenIcon('descripcion')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onOrdenChange('monto')}
                    className="h-auto p-0 font-medium"
                  >
                    Monto
                    {getOrdenIcon('monto')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onOrdenChange('fecha')}
                    className="h-auto p-0 font-medium"
                  >
                    Fecha
                    {getOrdenIcon('fecha')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onOrdenChange('estado')}
                    className="h-auto p-0 font-medium"
                  >
                    Estado
                    {getOrdenIcon('estado')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gastos.map((gasto) => (
                <TableRow key={gasto.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {gasto.descripcion}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatMonto(gasto.monto)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(gasto.fecha), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={gasto.estado === 'PAGADO' ? 'default' : 'secondary'}
                      className={
                        gasto.estado === 'PAGADO'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }
                    >
                      {gasto.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(gasto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(gasto.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
