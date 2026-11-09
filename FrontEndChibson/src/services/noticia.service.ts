import { apiClient } from './api';

export type CategoriaNoticia = 'PROMOCION' | 'EVENTO' | 'ANUNCIO';
// BORRADOR: guardada sin publicar · ACTIVADA: visible en la tienda · DESACTIVADA: oculta sin eliminarla
export type EstadoNoticia = 'BORRADOR' | 'ACTIVADA' | 'DESACTIVADA';

export interface Noticia {
  idNoticia: number;
  titulo: string;
  contenido: string;
  imagenUrl: string | null;
  categoria: CategoriaNoticia;
  estado: EstadoNoticia;
  fechaPublicacion: string | null; // "2026-11-08"; vacía mientras es borrador
  fechaModificacion: string;
}

// Lo que se manda al crear o editar
export interface NoticiaForm {
  titulo: string;
  contenido: string;
  imagenUrl: string;
  categoria: CategoriaNoticia;
  fechaPublicacion?: string;
  // Solo al crear: true se publica de inmediato, false queda como borrador
  publicar?: boolean;
}

const resource = '/noticias';

// Endpoints de administración (permiso GESTIONAR_NOTICIAS)
export const NoticiaService = {
  async listar(): Promise<Noticia[]> {
    const { data } = await apiClient.get<Noticia[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Noticia> {
    const { data } = await apiClient.get<Noticia>(`${resource}/${id}`);
    return data;
  },

  async crear(datos: NoticiaForm): Promise<Noticia> {
    const { data } = await apiClient.post<Noticia>(resource, datos);
    return data;
  },

  async actualizar(id: number, datos: NoticiaForm): Promise<Noticia> {
    const { data } = await apiClient.put<Noticia>(`${resource}/${id}`, datos);
    return data;
  },

  // Publica un borrador o vuelve a mostrar una desactivada
  async activar(id: number): Promise<Noticia> {
    const { data } = await apiClient.patch<Noticia>(`${resource}/${id}/activar`);
    return data;
  },

  // Solo para noticias activadas
  async desactivar(id: number): Promise<Noticia> {
    const { data } = await apiClient.patch<Noticia>(`${resource}/${id}/desactivar`);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  }
};

export default NoticiaService;
