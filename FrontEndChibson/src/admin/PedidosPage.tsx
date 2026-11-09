import { useSearchParams } from 'react-router';
import { RefreshCw } from 'lucide-react';

import usePedidos from '../hooks/usePedidos';
import useDevoluciones from '../hooks/useDevoluciones';
import useUsuarios from '../hooks/useUsuarios';
import { fechaDeHoy } from '../utils/formato';

import { TablaPedidos } from './components/TablaPedidos';
import { TablaDevoluciones } from './components/TablaDevoluciones';

import { Button } from '../components/ui/button';

type Pestana = 'pedidos' | 'devoluciones';

export const PedidosPage = () => {
  // 1. Datos del backend (se cargan los dos para mostrar los contadores en las pestañas)
  const pedidos = usePedidos();
  const devoluciones = useDevoluciones();
  const { usuarios } = useUsuarios();

  // 2. La pestaña va en la URL (/admin/pedidos?tab=devoluciones) para poder enlazarla desde el Dashboard
  const [params, setParams] = useSearchParams();
  const pestana: Pestana = params.get('tab') === 'devoluciones' ? 'devoluciones' : 'pedidos';
  const cambiarPestana = (p: Pestana) => setParams(p === 'pedidos' ? {} : { tab: p });

  // 3. RUT → nombre (clientes de las devoluciones y administradores del historial)
  const nombres = new Map(usuarios.map((u) => [u.rut, `${u.nombres} ${u.primerApellido}`]));
  const nombreUsuario = (rut: string) => nombres.get(rut) ?? rut;

  const porDespachar = pedidos.pedidos.filter((p) => p.estado === 'PAGADO' || p.estado === 'EN_PROCESO').length;
  const pendientes = devoluciones.devoluciones.filter((d) => d.estado === 'PENDIENTE').length;

  const loading = pedidos.loading || devoluciones.loading;
  const recargarTodo = () => {
    void pedidos.recargar();
    void devoluciones.recargar();
  };

  const PESTANAS: { valor: Pestana; texto: string; aviso: number }[] = [
    { valor: 'pedidos', texto: 'Pedidos', aviso: porDespachar },
    { valor: 'devoluciones', texto: 'Devoluciones', aviso: pendientes },
  ];

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Despacho de pedidos y solicitudes de devolución</p>
        </div>
        <Button variant="outline" onClick={recargarTodo} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Pestañas: la activa queda destacada y deshabilitada, igual que el navbar */}
      <div className="flex gap-1 border-b">
        {PESTANAS.map((p) => (
          <button
            key={p.valor}
            type="button"
            disabled={pestana === p.valor}
            onClick={() => cambiarPestana(p.valor)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              pestana === p.valor
                ? 'border-zinc-900 text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {p.texto}
            {p.aviso > 0 && (
              <span className="rounded-full bg-amber-100 px-2 text-xs text-amber-800" title="Por atender">{p.aviso}</span>
            )}
          </button>
        ))}
      </div>

      {pestana === 'pedidos' ? (
        <>
          {pedidos.error && (
            <p className="text-red-600">No se pudieron cargar los pedidos. Revisa que el gateway y ms-ventas estén encendidos.</p>
          )}
          <TablaPedidos
            pedidos={pedidos.pedidos}
            loading={pedidos.loading}
            nombreUsuario={nombreUsuario}
            recargar={pedidos.recargar}
          />
        </>
      ) : (
        <>
          {devoluciones.error && (
            <p className="text-red-600">No se pudieron cargar las devoluciones. Revisa que el gateway y ms-ventas estén encendidos.</p>
          )}
          <TablaDevoluciones
            devoluciones={devoluciones.devoluciones}
            loading={devoluciones.loading}
            nombreUsuario={nombreUsuario}
            recargar={devoluciones.recargar}
          />
        </>
      )}
    </section>
  );
};

export default PedidosPage;
