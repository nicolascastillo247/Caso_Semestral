import { useCallback, useEffect, useState } from 'react';
import TicketService, { type Ticket } from '../services/ticket.service';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TicketService.listar();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los tickets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarTickets();
  }, [cargarTickets]);

  return { tickets, loading, error, recargar: cargarTickets };
};

export default useTickets;
