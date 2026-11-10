import apiClient, { listaDe, type Coleccion, type ConEnlaces } from '../api/apiClient'

export interface Especificacion {
  clave: string
  valor: string
}

export interface Producto extends ConEnlaces {
  sku: string
  modelo: string
  marca: string
  descripcion: string | null
  precio: number
  categoria: string
  estado: string
  imagenUrl: string | null
  fichaTecnica: string | null
  especificaciones: Especificacion[]
  stockDisponible: number
  stockMinimo: number | null
  bajoStock: boolean
  agotado: boolean
  fechaModificacion: string | null
}

const resource = '/api/productos'

export const ProductoService = {
  async listar(): Promise<Producto[]> {
    const { data } = await apiClient.get<Coleccion<Producto>>(resource)
    return listaDe(data, 'productos')
  },

  async obtener(sku: string): Promise<Producto> {
    const { data } = await apiClient.get<Producto>(`${resource}/${encodeURIComponent(sku)}`)
    return data
  },

  async categorias(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${resource}/categorias`)
    return Array.isArray(data) ? data : []
  },
}

export default ProductoService
