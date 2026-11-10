import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'

export type CategoriaTicket = 'DESPACHO' | 'GARANTIA' | 'PAGO' | 'PEDIDO' | 'OTRO'

export interface MensajeTicket {
  idMensaje: number
  rutAutor: string
  esAdministrador: boolean
  contenido: string
  fecha: string
}

export interface Ticket extends ConEnlaces {
  numeroTicket: number
  rutCliente: string
  nombreCliente: string
  asunto: string
  categoria: CategoriaTicket
  descripcion: string
  adjuntoUrl: string | null
  estado: string
  calificacion: number | null
  comentarioCalificacion: string | null
  fechaCreacion: string
  fechaResolucion: string | null
  mensajes: MensajeTicket[]
}

export interface TicketPayload {
  asunto: string
  categoria: CategoriaTicket
  descripcion: string
  adjuntoUrl?: string
}

export interface CierrePayload {
  calificacion: number
  comentario: string
}

const resource = '/api/tickets'

export const TicketService = {
  async crear(datos: TicketPayload): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>(resource, datos)
    return data
  },

  async misTickets(): Promise<Ticket[]> {
    const { data } = await apiClient.get<Coleccion<Ticket>>(`${resource}/mis-tickets`)
    return listaDe(data, 'tickets')
  },

  async miTicket(numero: number): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`${resource}/mis-tickets/${numero}`)
    return data
  },

  async cerrar(numero: number, datos: CierrePayload): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`${resource}/mis-tickets/${numero}/cerrar`, datos)
    return data
  },
}

export default TicketService
