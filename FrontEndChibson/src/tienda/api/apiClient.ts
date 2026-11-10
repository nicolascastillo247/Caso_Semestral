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

// El backend identifica al usuario por el encabezado X-Rut-Usuario (no usa token).
// El RUT sale de la sesión que se guardó al iniciar sesión.
export const HEADER_RUT = 'X-Rut-Usuario'

const leerRut = (): string | null => {
  try {
    const guardada = localStorage.getItem(SESION_KEY)
    return guardada ? (JSON.parse(guardada) as { rut?: string }).rut ?? null : null
  } catch {
    return null
  }
}

apiClient.interceptors.request.use((config) => {
  const rut = leerRut()
  if (rut) {
    config.headers[HEADER_RUT] = rut
  }
  return config
})

apiClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Si se mandó un RUT y el backend responde 401, la sesión guardada ya no sirve
    const enviabaRut = Boolean(error?.config?.headers?.[HEADER_RUT])
    if (error?.response?.status === 401 && enviabaRut) {
      window.dispatchEvent(new Event(SESION_EXPIRADA))
    }
    return Promise.reject(error)
  },
)

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
