import { useCallback, useEffect, useState } from 'react';
import ReporteService, { type ReporteListado } from '../services/reporte.service';

export const useReportes = () => {
  const [reportes, setReportes] = useState<ReporteListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReporteService.listar();
      setReportes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los reportes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarReportes();
  }, [cargarReportes]);

  return { reportes, loading, error, recargar: cargarReportes };
};

export default useReportes;
