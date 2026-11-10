import apiClient, { type ConEnlaces } from '../api/apiClient'
import type { Usuario } from './usuario.service'

export interface Sesion {
  rut: string
  nombres: string
  primerApellido: string
  username: string
  rol: string
  permisos: string[]
}

export interface Credenciales {
  correo: string
  password: string
}

export interface RegistroPayload {
  rut: string
  nombres: string
  primerApellido: string
  segundoApellido: string
  username: string
  correo: string
  password: string
  confirmarPassword: string
}

export interface RecuperarPayload {
  rut: string
  correo: string
  nuevaPassword: string
  confirmarPassword: string
}

export interface CambioPasswordPayload {
  nuevaPassword: string
  confirmarPassword: string
}

const resource = '/api/auth'

export const AuthService = {
  async login(credenciales: Credenciales): Promise<Sesion> {
    const { data } = await apiClient.post<Sesion & ConEnlaces>(`${resource}/login`, credenciales)
    return {
      rut: data.rut,
      nombres: data.nombres,
      primerApellido: data.primerApellido,
      username: data.username,
      rol: data.rol,
      permisos: data.permisos ?? [],
    }
  },

  async registrar(datos: RegistroPayload): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>(`${resource}/registro`, datos)
    return data
  },

  async recuperarPassword(datos: RecuperarPayload): Promise<string> {
    const { data } = await apiClient.post<{ mensaje: string }>(`${resource}/recuperar`, datos)
    return data.mensaje
  },

  async cambiarPassword(datos: CambioPasswordPayload): Promise<string> {
    const { data } = await apiClient.put<{ mensaje: string }>(`${resource}/password`, datos)
    return data.mensaje
  },
}

export default AuthService
