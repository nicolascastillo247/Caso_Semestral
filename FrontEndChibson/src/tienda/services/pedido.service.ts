import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'

export type MetodoPago = 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA'

export interface ItemPedido {
  idItem: number
  sku: string
  nombreProducto: string
  categoria: string
  cantidad: number
  precioUnitario: number
}

export interface HistorialEstado {
  idHistorial: number
  estadoAnterior: string | null
  estadoNuevo: string
  rutResponsable: string | null
  fecha: string
}

export interface Pago {
  idPago: number
  metodo: MetodoPago
  monto: number
  estado: 'APROBADO' | 'RECHAZADO'
  motivoRechazo: string | null
  fecha: string
}

export interface Direccion {
  region: string
  ciudadComuna: string
  condominio: string | null
  numero: string
  alternativa: boolean
}

export interface Pedido extends ConEnlaces {
  numeroPedido: number
  rutCliente: string
  nombreCliente: string
  fecha: string
  estado: string
  subtotal: number
  costoEnvio: number
  iva: number
  total: number
  metodoPago: MetodoPago | null
  direccion: Direccion | null
  motivoCancelacion: string | null
  items: ItemPedido[]
  historial: HistorialEstado[]
  pagos: Pago[]
}

export interface CompraRespuesta extends ConEnlaces {
  aprobado: boolean
  mensaje: string
  pedido: Pedido
}

export interface ItemCompra {
  sku: string
  cantidad: number
}

export interface CheckoutPayload {
  items: ItemCompra[]
  metodoPago: MetodoPago
  usarDireccionDistinta: boolean
  region?: string
  ciudadComuna?: string
  condominio?: string
  numero?: string
  simularRechazo?: boolean
}

const resource = '/api/pedidos'

const aceptaPagoRechazado = { validateStatus: (estado: number) => estado === 201 || estado === 402 }

export const PedidoService = {
  async comprar(datos: CheckoutPayload): Promise<CompraRespuesta> {
    const { data } = await apiClient.post<CompraRespuesta>(`${resource}/checkout`, datos, aceptaPagoRechazado)
    return data
  },

  async reintentarPago(numero: number, metodoPago: MetodoPago, simularRechazo = false): Promise<CompraRespuesta> {
    const { data } = await apiClient.post<CompraRespuesta>(
      `${resource}/${numero}/pagar`,
      { metodoPago, simularRechazo },
      aceptaPagoRechazado,
    )
    return data
  },

  async misPedidos(): Promise<Pedido[]> {
    const { data } = await apiClient.get<Coleccion<Pedido>>(`${resource}/mis-pedidos`)
    return listaDe(data, 'pedidos')
  },

  async miPedido(numero: number): Promise<Pedido> {
    const { data } = await apiClient.get<Pedido>(`${resource}/mis-pedidos/${numero}`)
    return data
  },
}

export default PedidoService
