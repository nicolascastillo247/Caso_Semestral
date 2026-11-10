import apiClient, { type ConEnlaces } from '../api/apiClient'

export interface Resena extends ConEnlaces {
  idResena: number
  sku: string
  modeloProducto: string
  rutCliente: string
  nombreCliente: string
  calificacion: number
  titulo: string
  comentario: string | null
  estado: string
  respuestaAdmin: string | null
  fecha: string
  fechaRespuesta: string | null
}

export interface ResenasProducto extends ConEnlaces {
  sku: string
  promedio: number
  total: number
  resenas: Resena[]
}

export interface ResenaPayload {
  sku: string
  calificacion: number
  titulo: string
  comentario: string
}

const resource = '/api/resenas'

export const ResenaService = {
  async listarAprobadas(sku: string): Promise<ResenasProducto> {
    const { data } = await apiClient.get<ResenasProducto>(`${resource}/producto/${encodeURIComponent(sku)}`)
    return { ...data, resenas: data.resenas ?? [] }
  },

  async crear(datos: ResenaPayload): Promise<Resena> {
    const { data } = await apiClient.post<Resena>(resource, datos)
    return data
  },
}

export default ResenaService
