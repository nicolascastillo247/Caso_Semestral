import { useCallback, useEffect, useState } from 'react';
import DevolucionService, { type Devolucion } from '../services/devolucion.service';

export const useDevoluciones = () => {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarDevoluciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DevolucionService.listar();
      setDevoluciones(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar las devoluciones'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDevoluciones();
  }, [cargarDevoluciones]);

  return { devoluciones, loading, error, recargar: cargarDevoluciones };
};

export default useDevoluciones;
