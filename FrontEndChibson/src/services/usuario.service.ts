import { apiClient } from './api';

export type EstadoUsuario = 'ACTIVO' | 'DESACTIVADO';
export type RolUsuario = 'ADMINISTRADOR' | 'CLIENTE';

export interface Usuario {
  rut: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  username: string;
  correo: string;
  telefono: string | null;
  // Dirección predeterminada: la completa el cliente en "Mi perfil"
  region: string | null;
  ciudadComuna: string | null;
  condominio: string | null;
  numero: string | null;
  estado: EstadoUsuario;
  fechaRegistro: string | null; // "2026-11-08"
  rol: RolUsuario;
}

// Lo que se manda al crear o editar. rut y password solo se usan al crear.
export interface UsuarioForm {
  rut?: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  username: string;
  correo: string;
  telefono: string;
  rol: RolUsuario;
  password?: string;
}

const resource = '/usuarios';

// Endpoints de administración (permiso GESTIONAR_USUARIOS)
export const UsuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Usuario[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(rut: string): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`${resource}/${rut}`);
    return data;
  },

  async crear(datos: UsuarioForm): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>(resource, datos);
    return data;
  },

  async actualizar(rut: string, datos: UsuarioForm): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`${resource}/${rut}`, datos);
    return data;
  },

  // HU-70: cambia solo el rol (queda en el historial como "Asignó el rol ...")
  async asignarRol(rut: string, rol: RolUsuario): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(`${resource}/${rut}/rol`, { rol });
    return data;
  },

  async desactivar(rut: string): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(`${resource}/${rut}/desactivar`);
    return data;
  },

  async reactivar(rut: string): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(`${resource}/${rut}/reactivar`);
    return data;
  },

  // El backend no deja eliminar a un usuario con pedidos (hay que desactivarlo)
  async eliminar(rut: string): Promise<void> {
    await apiClient.delete(`${resource}/${rut}`);
  }
};

export default UsuarioService;
