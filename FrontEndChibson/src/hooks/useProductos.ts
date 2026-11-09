import { useCallback, useEffect, useState } from 'react';
import ProductoService, { type Producto } from '../services/producto.service';

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductoService.listar();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los productos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  return { productos, loading, error, recargar: cargarProductos };
};

export default useProductos;
