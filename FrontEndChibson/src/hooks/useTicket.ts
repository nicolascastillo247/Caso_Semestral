import { useCallback, useEffect, useState } from 'react';
import TicketService, { type Ticket } from '../services/ticket.service';

// Carga UN ticket con su conversación. Con numero = null no hace nada (modal cerrado).
export const useTicket = (numero: number | null) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarTicket = useCallback(async () => {
    setTicket(null);
    if (numero === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await TicketService.obtener(numero);
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar el ticket'));
    } finally {
      setLoading(false);
    }
  }, [numero]);

  useEffect(() => {
    void cargarTicket();
  }, [cargarTicket]);

  // setTicket se expone para poner el ticket que devuelve el backend después de responder o cambiar estado
  return { ticket, setTicket, loading, error, recargar: cargarTicket };
};

export default useTicket;
