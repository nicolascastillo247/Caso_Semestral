import { useCallback, useEffect, useState } from 'react';
import VentaService, { type Venta } from '../services/venta.service';
import DashboardService, {
  type PedidoResumen, type ProductoStockBajo,
} from '../services/dashboard.service';

// null = ese microservicio no respondió; la tarjeta muestra "Sin datos" en vez de romper la página
export interface DatosDashboard {
  ventas: Venta[] | null;
  pedidos: PedidoResumen[] | null;
  stockBajo: ProductoStockBajo[] | null;
  ticketsAbiertos: number | null;
  devolucionesPendientes: number | null;
  clientesNuevosHoy: number | null;
}

const VACIO: DatosDashboard = {
  ventas: null,
  pedidos: null,
  stockBajo: null,
  ticketsAbiertos: null,
  devolucionesPendientes: null,
  clientesNuevosHoy: null,
};

// Si la promesa salió bien devuelve su valor; si falló, null
const valor = <T,>(resultado: PromiseSettledResult<T>): T | null =>
  resultado.status === 'fulfilled' ? resultado.value : null;

export const useDashboard = () => {
  const [datos, setDatos] = useState<DatosDashboard>(VACIO);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    // Las 6 llamadas salen al mismo tiempo. allSettled espera a todas aunque alguna falle.
    const [ventas, pedidos, stockBajo, tickets, devoluciones, clientes] = await Promise.allSettled([
      VentaService.listar(),
      DashboardService.listarPedidos(),
      DashboardService.listarStockBajo(),
      DashboardService.contarTicketsAbiertos(),
      DashboardService.contarDevolucionesPendientes(),
      DashboardService.contarClientesNuevosHoy(),
    ]);
    setDatos({
      ventas: valor(ventas),
      pedidos: valor(pedidos),
      stockBajo: valor(stockBajo),
      ticketsAbiertos: valor(tickets),
      devolucionesPendientes: valor(devoluciones),
      clientesNuevosHoy: valor(clientes),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { datos, loading, recargar: cargar };
};

export default useDashboard;
