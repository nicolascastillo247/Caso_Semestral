import { SESION_KEY } from '../tienda/api/apiClient'
import type { Sesion } from '../tienda/services/auth.service'

// Arma un JWT de prueba con el mismo formato que el del backend (encabezado.datos.firma).
// La firma es falsa: el frontend no la revisa, eso lo hace el gateway.
const base64Url = (objeto: object) =>
  btoa(JSON.stringify(objeto)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const crearToken = (datos: object) => `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(datos)}.firma`

// Segundos desde 1970, que es como el JWT guarda las fechas
export const enSegundos = (fecha: number) => Math.floor(fecha / 1000)

// Sesión como la que guarda el login, con un token que vence en 1 hora
export const sesionDePrueba = (rol: 'ADMINISTRADOR' | 'CLIENTE'): Sesion => {
  const rut = rol === 'ADMINISTRADOR' ? '12345678-5' : '11111111-1'
  return {
    rut,
    nombres: rol === 'ADMINISTRADOR' ? 'Admin' : 'Ana',
    primerApellido: 'Prueba',
    username: rol === 'ADMINISTRADOR' ? 'admin' : 'anaperez',
    rol,
    permisos: [],
    token: crearToken({ sub: rut, rol, exp: enSegundos(Date.now() + 60 * 60 * 1000) }),
  }
}

export const guardarSesion = (sesion: Sesion) => localStorage.setItem(SESION_KEY, JSON.stringify(sesion))
