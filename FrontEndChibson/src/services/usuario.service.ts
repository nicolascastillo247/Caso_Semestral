import { apiClient } from './api';

// Solo los campos que se usan por ahora; se completan al hacer la página de Usuarios.
export interface Usuario {
  rut: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  rol: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const resource = '/usuarios';

export const UsuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Usuario[]>(resource);
    return Array.isArray(data) ? data : [];
  }
};

export default UsuarioService;
