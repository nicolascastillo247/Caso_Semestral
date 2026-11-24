import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8088'

export const SESION_KEY = 'chibson.sesion'
export const SESION_EXPIRADA = 'chibson:sesion-expirada'

export interface Enlace {
  href: string
}

export interface ConEnlaces {
  _links?: Record<string, Enlace>
}

export interface Coleccion<T> {
  _embedded?: Record<string, T[]>
  _links?: Record<string, Enlace>
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Autenticación con JWT: al iniciar sesión el backend entrega un token que se guarda en la sesión.
// Cada petición lo envía en el encabezado "Authorization: Bearer <token>". El gateway lo valida
// y, con el RUT que viene dentro del token, identifica al usuario ante los microservicios.
export const HEADER_AUTORIZACION = 'Authorization'

export const tokenSesion = (): string | null => {
  try {
    const guardada = localStorage.getItem(SESION_KEY)
    return guardada ? (JSON.parse(guardada) as { token?: string }).token ?? null : null
  } catch {
    return null
  }
}

type ClienteAxios = ReturnType<typeof axios.create>

// Se usa en el cliente de la tienda y en el del panel de administración
export const agregarToken = (cliente: ClienteAxios) => {
  cliente.interceptors.request.use((config) => {
    const token = tokenSesion()
    if (token) {
      config.headers[HEADER_AUTORIZACION] = `Bearer ${token}`
    }
    return config
  })

  cliente.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      // Si se mandó el token y el backend responde 401, el token expiró o no es válido
      const enviabaToken = Boolean(error?.config?.headers?.[HEADER_AUTORIZACION])
      if (error?.response?.status === 401 && enviabaToken) {
        window.dispatchEvent(new Event(SESION_EXPIRADA))
      }
      return Promise.reject(error)
    },
  )
}

agregarToken(apiClient)

// Nuestro backend devuelve las listas como un arreglo normal [...].
// Si alguna vez llegan con HATEOAS ({ _embedded: { productos: [...] } }), también se aceptan.
export const listaDe = <T>(datos: T[] | Coleccion<T> | undefined, nombre: string): T[] => {
  if (Array.isArray(datos)) return datos
  return datos?._embedded?.[nombre] ?? []
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Revisa los datos ingresados.',
  401: 'Debes iniciar sesión.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No se encontró lo que buscabas.',
  409: 'La operación no se puede realizar en este momento.',
  503: 'El servicio no está disponible. Intenta nuevamente en unos minutos.',
}

export const mensajeDeError = (error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.'
    }
    const datos = error.response.data as { message?: string; mensaje?: string } | undefined
    return datos?.message || datos?.mensaje || MENSAJES_POR_ESTADO[error.response.status] || porDefecto
  }
  return error instanceof Error ? error.message : porDefecto
}

export default apiClient
