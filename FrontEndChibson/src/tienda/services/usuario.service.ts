import apiClient, { type ConEnlaces } from '../api/apiClient'

export interface Usuario extends ConEnlaces {
  rut: string
  nombres: string
  primerApellido: string
  segundoApellido: string
  username: string
  correo: string
  telefono: string | null
  region: string | null
  ciudadComuna: string | null
  condominio: string | null
  numero: string | null
  estado: string
  fechaRegistro: string
  rol: string
}

export interface PerfilPayload {
  nombres: string
  primerApellido: string
  segundoApellido: string
  username: string
  telefono: string
  region: string
  ciudadComuna: string
  condominio: string
  numero: string
}

const resource = '/api/usuarios'

export const UsuarioService = {
  async obtenerPerfil(): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`${resource}/perfil`)
    return data
  },

  async actualizarPerfil(datos: PerfilPayload): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`${resource}/perfil`, datos)
    return data
  },
}

export const tieneDireccion = (usuario?: Usuario | null): boolean =>
  Boolean(usuario?.region && usuario?.ciudadComuna && usuario?.numero)

export const direccionTexto = (usuario?: Usuario | null): string =>
  [usuario?.numero, usuario?.condominio, usuario?.ciudadComuna, usuario?.region].filter(Boolean).join(', ')

export default UsuarioService
