import ProductoService from '../services/producto.service'
import useApi from './useApi'

export const useProductos = () => {
  const { datos, cargando, error, recargar } = useApi(() => ProductoService.listar())
  return { productos: datos ?? [], cargando, error, recargar }
}

export const useProducto = (sku: string) => {
  const { datos, cargando, error, recargar } = useApi(() => ProductoService.obtener(sku), [sku])
  return { producto: datos, cargando, error, recargar }
}

export default useProductos
