import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'
import type { ItemCompra } from './pedido.service'

export type MotivoDevolucion = 'PRODUCTO_DANADO' | 'PRODUCTO_DEFECTUOSO' | 'PRODUCTO_INCORRECTO' | 'OTRO'

export interface ItemDevolucion {
  idItemDevolucion: number
  sku: string
  nombreProducto: string
  cantidad: number
  precioUnitario: number
}

export interface Devolucion extends ConEnlaces {
  numeroSeguimiento: number
  numeroPedido: number
  rutCliente: string
  items: ItemDevolucion[]
  motivo: MotivoDevolucion
  descripcion: string | null
  evidenciaUrl: string | null
  estado: string
  motivoRechazo: string | null
  fechaSolicitud: string
  fechaResolucion: string | null
  montoReembolsado: number | null
  fechaReembolso: string | null
}

export interface DevolucionPayload {
  numeroPedido: number
  items: ItemCompra[]
  motivo: MotivoDevolucion
  descripcion: string
  evidenciaUrl?: string
}

const resource = '/api/devoluciones'

export const DevolucionService = {
  async solicitar(datos: DevolucionPayload): Promise<Devolucion> {
    const { data } = await apiClient.post<Devolucion>(resource, datos)
    return data
  },

  async misDevoluciones(): Promise<Devolucion[]> {
    const { data } = await apiClient.get<Coleccion<Devolucion>>(`${resource}/mis-devoluciones`)
    return listaDe(data, 'devoluciones')
  },
}

export default DevolucionService
