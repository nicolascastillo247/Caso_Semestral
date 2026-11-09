import { useCallback, useEffect, useState } from 'react';
import ResenaService, { type Resena } from '../services/resena.service';

export const useResenas = () => {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarResenas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ResenaService.listar();
      setResenas(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar las reseñas'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarResenas();
  }, [cargarResenas]);

  return { resenas, loading, error, recargar: cargarResenas };
};

export default useResenas;
