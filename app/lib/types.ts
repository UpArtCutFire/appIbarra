
export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: Date;
  estado: 'PENDIENTE' | 'PAGADO';
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfiguracionCorreo {
  id: number;
  servidorSmtp: string;
  puerto: number;
  usuario: string;
  password: string;
  emailRemitente: string;
  frecuenciaHoras: number;
  activo: boolean;
  ultimoEnvio?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name?: string;
  password: string;
}

export interface GastoFormData {
  descripcion: string;
  monto: number;
  fecha: string;
  estado: 'PENDIENTE' | 'PAGADO';
}

export interface FiltrosGastos {
  descripcion?: string;
  montoMin?: number;
  montoMax?: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: 'PENDIENTE' | 'PAGADO' | 'TODOS';
}

export interface OrdenGastos {
  campo: 'descripcion' | 'monto' | 'fecha' | 'estado';
  direccion: 'asc' | 'desc';
}
