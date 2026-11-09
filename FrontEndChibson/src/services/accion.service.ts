import { apiClient } from './api';

export interface DetalleCambio {
  idDetalle: number;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
}

export type TipoAccion = 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'ACTIVAR' | 'DESACTIVAR';

export interface RegistroAccion {
  idRegistro: number;
  rutAdministrador: string;
  tipo: TipoAccion;
  modulo: string;
  descripcion: string;
  fecha: string;
  cambios: DetalleCambio[];
}

const resource = '/acciones';

// Historial de acciones (HU-73). Es de solo lectura: no hay crear, editar ni eliminar.
export const AccionService = {
  async listar(): Promise<RegistroAccion[]> {
    const { data } = await apiClient.get<RegistroAccion[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  // Acciones de un administrador ("Historial del usuario" en la página de Usuarios)
  async listarPorAdministrador(rut: string): Promise<RegistroAccion[]> {
    const { data } = await apiClient.get<RegistroAccion[]>(`${resource}/administrador/${rut}`);
    return Array.isArray(data) ? data : [];
  }
};

export default AccionService;
