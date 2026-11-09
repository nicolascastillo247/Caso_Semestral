import { useCallback, useEffect, useState } from 'react';
import AccionService, { type RegistroAccion } from '../services/accion.service';

// Acciones de UN administrador. Con rut = null no hace nada (modal cerrado).
export const useAccionesAdministrador = (rut: string | null) => {
  const [acciones, setAcciones] = useState<RegistroAccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarAcciones = useCallback(async () => {
    setAcciones([]);
    if (rut === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await AccionService.listarPorAdministrador(rut);
      setAcciones(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el historial'));
    } finally {
      setLoading(false);
    }
  }, [rut]);

  useEffect(() => {
    void cargarAcciones();
  }, [cargarAcciones]);

  return { acciones, loading, error, recargar: cargarAcciones };
};

export default useAccionesAdministrador;
