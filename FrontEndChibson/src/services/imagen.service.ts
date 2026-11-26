import { apiClient } from './api';

// Las imágenes de productos y noticias se guardan en una carpeta del backend.
// Al subir una, el backend responde con el nombre del archivo (lo que se guarda en la base de datos)
// y la dirección para mostrarla.
export interface ImagenSubida {
  imagen: string; // "3f2a9c....png"
  imagenUrl: string; // "/imagenes/productos/3f2a9c....png"
}

// Formatos y tamaño que acepta el backend
export const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024; // 5 MB

// ruta: '/productos/imagen' o '/noticias/imagen'
export const subirImagen = async (ruta: string, archivo: File): Promise<ImagenSubida> => {
  const formulario = new FormData();
  formulario.append('archivo', archivo);
  // multipart/form-data: el navegador agrega solo el "boundary" que separa las partes
  const { data } = await apiClient.post<ImagenSubida>(ruta, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
