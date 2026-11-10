import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'

export interface Notificacion extends ConEnlaces {
  idNotificacion: number
  mensaje: string
  referencia: string | null
  leida: boolean
  fecha: string
}

const resource = '/api/notificaciones'

export const NotificacionService = {
  async listar(): Promise<Notificacion[]> {
    const { data } = await apiClient.get<Coleccion<Notificacion>>(resource)
    return listaDe(data, 'notificaciones')
  },

  async marcarLeida(id: number): Promise<Notificacion> {
    const { data } = await apiClient.patch<Notificacion>(`${resource}/${id}/leida`)
    return data
  },
}

export default NotificacionService
