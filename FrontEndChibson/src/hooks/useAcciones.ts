import { useCallback, useEffect, useState } from 'react';
import AccionService, { type RegistroAccion } from '../services/accion.service';

export const useAcciones = () => {
  const [acciones, setAcciones] = useState<RegistroAccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarAcciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AccionService.listar();
      setAcciones(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el historial'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarAcciones();
  }, [cargarAcciones]);

  return { acciones, loading, error, recargar: cargarAcciones };
};

export default useAcciones;
