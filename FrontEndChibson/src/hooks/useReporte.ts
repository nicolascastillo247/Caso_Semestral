import { useCallback, useEffect, useState } from 'react';
import ReporteService, { type Reporte } from '../services/reporte.service';

// Carga el detalle de UN reporte. Con id = null no hace nada (modal cerrado).
export const useReporte = (id: number | null) => {
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarReporte = useCallback(async () => {
    setReporte(null);
    if (id === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ReporteService.obtener(id);
      setReporte(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el reporte'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void cargarReporte();
  }, [cargarReporte]);

  return { reporte, loading, error, recargar: cargarReporte };
};

export default useReporte;
