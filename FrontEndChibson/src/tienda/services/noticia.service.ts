import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'

export interface Noticia extends ConEnlaces {
  idNoticia: number
  titulo: string
  contenido: string
  imagenUrl: string | null
  categoria: string
  estado: string
  fechaPublicacion: string | null
  fechaModificacion: string | null
}

const resource = '/api/noticias'

export const NoticiaService = {
  async listarPublicadas(): Promise<Noticia[]> {
    const { data } = await apiClient.get<Coleccion<Noticia>>(`${resource}/publicadas`)
    return listaDe(data, 'noticias')
  },

  async obtenerPublicada(id: number): Promise<Noticia> {
    const { data } = await apiClient.get<Noticia>(`${resource}/publicadas/${id}`)
    return data
  },
}

export default NoticiaService
