import { useCallback, useEffect, useState } from 'react';
import UsuarioService, { type Usuario } from '../services/usuario.service';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UsuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los usuarios'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  return { usuarios, loading, error, recargar: cargarUsuarios };
};

export default useUsuarios;
