import { apiClient } from './api';

export type Categoria = 'GUITARRA' | 'BAJO' | 'PERCUSION' | 'TECLAS' | 'VIENTO' | 'CUERDAS';
// INACTIVO = no aparece en el catálogo público. "Agotado" no es un estado: es stock 0.
export type EstadoProducto = 'ACTIVO' | 'INACTIVO';

// Una fila de la ficha técnica ya interpretada, por ejemplo { clave: 'Cuerpo', valor: 'Caoba' }
export interface Especificacion {
  clave: string;
  valor: string;
}

export interface Producto {
  sku: string; // lo genera el backend, por ejemplo GTR-0001
  modelo: string;
  marca: string;
  descripcion: string | null;
  precio: number;
  categoria: Categoria;
  estado: EstadoProducto;
  imagenUrl: string;
  fichaTecnica: string | null; // texto original "cuerpo:caoba;trastes:22"
  especificaciones: Especificacion[];
  stockDisponible: number;
  stockMinimo: number;
  bajoStock: boolean;
  agotado: boolean;
  fechaModificacion: string | null;
  fechaModificacionFicha: string | null;
}

// Lo que se manda al crear o editar
export interface ProductoForm {
  modelo: string;
  marca: string;
  descripcion: string;
  precio: number;
  categoria: Categoria;
  imagenUrl: string;
  stockDisponible: number; // al crear es el stock inicial
  stockMinimo: number;
  activo?: boolean; // solo al crear
}

const resource = '/productos';

// Endpoints de administración (permiso GESTIONAR_PRODUCTOS)
export const ProductoService = {
  // Incluye los inactivos (el GET /productos público solo trae los activos)
  async listar(): Promise<Producto[]> {
    const { data } = await apiClient.get<Producto[]>(`${resource}/admin`);
    return Array.isArray(data) ? data : [];
  },

  async obtener(sku: string): Promise<Producto> {
    const { data } = await apiClient.get<Producto>(`${resource}/admin/${sku}`);
    return data;
  },

  async crear(datos: ProductoForm): Promise<Producto> {
    const { data } = await apiClient.post<Producto>(resource, datos);
    return data;
  },

  async actualizar(sku: string, datos: ProductoForm): Promise<Producto> {
    const { data } = await apiClient.put<Producto>(`${resource}/${sku}`, datos);
    return data;
  },

  async desactivar(sku: string): Promise<Producto> {
    const { data } = await apiClient.patch<Producto>(`${resource}/${sku}/desactivar`);
    return data;
  },

  async reactivar(sku: string): Promise<Producto> {
    const { data } = await apiClient.patch<Producto>(`${resource}/${sku}/reactivar`);
    return data;
  },

  // El backend no deja eliminar un producto que ya está en algún pedido (hay que desactivarlo)
  async eliminar(sku: string): Promise<void> {
    await apiClient.delete(`${resource}/${sku}`);
  },

  // Ficha técnica: POST la primera vez, PUT para editarla
  async agregarFicha(sku: string, texto: string): Promise<Producto> {
    const { data } = await apiClient.post<Producto>(`${resource}/${sku}/ficha-tecnica`, { texto });
    return data;
  },

  async editarFicha(sku: string, texto: string): Promise<Producto> {
    const { data } = await apiClient.put<Producto>(`${resource}/${sku}/ficha-tecnica`, { texto });
    return data;
  }
};

export default ProductoService;
