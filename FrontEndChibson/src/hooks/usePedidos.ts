import { useCallback, useEffect, useState } from 'react';
import PedidoService, { type Pedido } from '../services/pedido.service';

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PedidoService.listar();
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los pedidos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarPedidos();
  }, [cargarPedidos]);

  return { pedidos, loading, error, recargar: cargarPedidos };
};

export default usePedidos;
