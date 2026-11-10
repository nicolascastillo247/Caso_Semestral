import apiClient, { type ConEnlaces } from '../api/apiClient'

export interface InformacionInstitucional extends ConEnlaces {
  idInformacion: number
  mision: string | null
  vision: string | null
  correo: string | null
  telefono: string | null
  direccion: string | null
}

export const InstitucionalService = {
  async obtener(): Promise<InformacionInstitucional> {
    const { data } = await apiClient.get<InformacionInstitucional>('/api/institucional')
    return data
  },
}

export default InstitucionalService
