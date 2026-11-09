import { useCallback, useEffect, useState } from 'react';
import NoticiaService, { type Noticia } from '../services/noticia.service';

export const useNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarNoticias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NoticiaService.listar();
      setNoticias(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar las noticias'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarNoticias();
  }, [cargarNoticias]);

  return { noticias, loading, error, recargar: cargarNoticias };
};

export default useNoticias;
