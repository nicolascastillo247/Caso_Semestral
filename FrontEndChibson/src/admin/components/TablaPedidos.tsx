import { useState } from 'react';
import { ChevronDown, Filter, Search, SlidersHorizontal } from 'lucide-react';

import type { Pedido } from '../../services/pedido.service';
import type { EstadoPedido, MetodoPago } from '../../services/venta.service';
import { estiloCampo, fechaHora, pesos, textoEnum } from '../../utils/formato';

import { Paginacion } from './Paginacion';
import { PedidoDialog } from './PedidoDialog';
import { ESTADOS_PEDIDO, EstadoPedidoBadge, textoDestino } from './EstadosPedido';

import { Button, buttonVariants } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';

const FILAS_POR_PAGINA = 10;
const METODOS: MetodoPago[] = ['DEBITO', 'CREDITO', 'TRANSFERENCIA'];

interface TablaPedidosProps {
  pedidos: Pedido[];
  loading: boolean;
  nombreUsuario: (rut: string) => string;
  recargar: () => Promise<void>;
}

// Pestaña "Pedidos"
export const TablaPedidos = ({ pedidos, loading, nombreUsuario, recargar }: TablaPedidosProps) => {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoPedido | ''>('');
  const [region, setRegion] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [numeroSeleccionado, setNumeroSeleccionado] = useState<number | null>(null);

  // El modal toma el pedido desde la lista: al recargar, se actualiza solo
  const seleccionado = pedidos.find((p) => p.numeroPedido === numeroSeleccionado) ?? null;

  // Regiones que aparecen en los pedidos, para el filtro
  const regiones = [...new Set(pedidos.map((p) => p.direccion?.region).filter((r): r is string => !!r))].sort();

  const busqueda = texto.trim().toLowerCase();
  const filtrados = pedidos.filter((p) => {
    const dia = p.fecha.slice(0, 10);
    const coincideTexto =
      busqueda === '' ||
      String(p.numeroPedido).padStart(4, '0').includes(busqueda) ||
      (p.nombreCliente ?? '').toLowerCase().includes(busqueda) ||
      p.rutCliente.includes(busqueda) ||
      textoDestino(p.direccion).toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || p.estado === estado) &&
      (region === '' || p.direccion?.region === region) &&
      (metodo === '' || p.metodoPago === metodo) &&
      (desde === '' || dia >= desde) &&
      (hasta === '' || dia <= hasta)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  const filtrosActivos = [region, metodo, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setRegion('');
    setMetodo('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const cuantos = (e: EstadoPedido) => pedidos.filter((p) => p.estado === e).length;

  return (
    <div className="space-y-6">
      {/* Botones rápidos por estado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS_PEDIDO] as (EstadoPedido | '')[]).map((e) => (
          <Button
            key={e || 'TODOS'}
            size="sm"
            variant={estado === e ? 'default' : 'outline'}
            disabled={estado === e}
            onClick={() => {
              setEstado(e);
              setPagina(1);
            }}
          >
            {e === '' ? `Todos (${pedidos.length})` : `${textoEnum(e)} (${cuantos(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por N° de pedido, cliente, RUT o destino..."
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: 'default' })}>
            <Filter />
            Filtros
            {filtrosActivos > 0 && (
              <span className="ml-1 rounded-full bg-background px-1.5 text-xs text-foreground">{filtrosActivos}</span>
            )}
            <ChevronDown />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              Región de destino
              <select
                className={estiloCampo}
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {regiones.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Método de pago
              <select
                className={estiloCampo}
                value={metodo}
                onChange={(e) => {
                  setMetodo(e.target.value as MetodoPago | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {METODOS.map((m) => (
                  <option key={m} value={m}>{textoEnum(m)}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Desde
              <input
                type="date"
                className={estiloCampo}
                value={desde}
                max={hasta || undefined}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPagina(1);
                }}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Hasta
              <input
                type="date"
                className={estiloCampo}
                value={hasta}
                min={desde || undefined}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPagina(1);
                }}
              />
            </label>

            <Button variant="outline" className="w-full" onClick={limpiarFiltros} disabled={filtrosActivos === 0}>
              Limpiar filtros
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tabla: cambiar estado, cancelar y eliminar se hacen dentro del modal */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">N° Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ningún pedido coincide con los filtros.' : 'No hay pedidos registrados.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((p) => (
            <TableRow key={p.numeroPedido}>
              <TableCell>{String(p.numeroPedido).padStart(4, '0')}</TableCell>
              <TableCell>{p.nombreCliente ?? p.rutCliente}</TableCell>
              <TableCell>{fechaHora(p.fecha)}</TableCell>
              <TableCell>{textoDestino(p.direccion)}</TableCell>
              <TableCell className="text-right">{pesos(p.total)}</TableCell>
              <TableCell><EstadoPedidoBadge estado={p.estado} /></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => setNumeroSeleccionado(p.numeroPedido)}>
                  <SlidersHorizontal /> Gestionar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={filtrados.length}
        nombre={['pedido', 'pedidos']}
        onCambiar={setPagina}
      />

      <PedidoDialog
        pedido={seleccionado}
        nombreUsuario={nombreUsuario}
        onCerrar={() => setNumeroSeleccionado(null)}
        onCambio={recargar}
        onEliminado={() => {
          setNumeroSeleccionado(null);
          void recargar();
        }}
      />
    </div>
  );
};

export default TablaPedidos;
