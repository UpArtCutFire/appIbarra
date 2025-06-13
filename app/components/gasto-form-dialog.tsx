
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Gasto, GastoFormData } from '@/lib/types';

interface GastoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gasto?: Gasto | null;
  onSuccess: () => void;
}

export function GastoFormDialog({
  open,
  onOpenChange,
  gasto,
  onSuccess,
}: GastoFormDialogProps) {
  const [formData, setFormData] = useState<GastoFormData>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PENDIENTE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (gasto) {
      setFormData({
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: new Date(gasto.fecha).toISOString().split('T')[0],
        estado: gasto.estado,
      });
    } else {
      setFormData({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE',
      });
    }
  }, [gasto, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = gasto ? `/api/gastos/${gasto.id}` : '/api/gastos';
      const method = gasto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: gasto ? 'Gasto actualizado' : 'Gasto creado',
          description: gasto 
            ? 'El gasto ha sido actualizado exitosamente'
            : 'El gasto ha sido creado exitosamente',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Error al procesar la solicitud',
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

  const handleInputChange = (campo: keyof GastoFormData, valor: string | number) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {gasto ? 'Editar Gasto' : 'Nuevo Gasto'}
          </DialogTitle>
          <DialogDescription>
            {gasto 
              ? 'Modifica los datos del gasto seleccionado'
              : 'Completa los datos para registrar un nuevo gasto'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                placeholder="Descripción del gasto"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto">Monto (CLP)</Label>
              <Input
                id="monto"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.monto}
                onChange={(e) => handleInputChange('monto', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value as 'PENDIENTE' | 'PAGADO')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (gasto ? 'Actualizando...' : 'Creando...') 
                : (gasto ? 'Actualizar' : 'Crear')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
