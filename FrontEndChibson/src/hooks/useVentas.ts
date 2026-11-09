import { useCallback, useEffect, useState } from 'react';
import VentaService, { type Venta } from '../services/venta.service';

export const useVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VentaService.listar();
      setVentas(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar las ventas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarVentas();
  }, [cargarVentas]);

  return { ventas, loading, error, recargar: cargarVentas };
};

export default useVentas;
