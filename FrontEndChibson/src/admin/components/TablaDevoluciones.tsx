import { useState } from 'react';
import { ChevronDown, Filter, Search, SlidersHorizontal } from 'lucide-react';

import type { Devolucion, EstadoDevolucion, MotivoDevolucion } from '../../services/devolucion.service';
import { estiloCampo, fechaHora, pesos, textoEnum } from '../../utils/formato';

import { Paginacion } from './Paginacion';
import { DevolucionDialog, montoDevolucion } from './DevolucionDialog';
import { ESTADOS_DEVOLUCION, EstadoDevolucionBadge, NOMBRE_MOTIVO } from './EstadosPedido';

import { Button, buttonVariants } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';

const FILAS_POR_PAGINA = 10;

interface TablaDevolucionesProps {
  devoluciones: Devolucion[];
  loading: boolean;
  nombreUsuario: (rut: string) => string;
  recargar: () => Promise<void>;
}

// Pestaña "Devoluciones"
export const TablaDevoluciones = ({ devoluciones, loading, nombreUsuario, recargar }: TablaDevolucionesProps) => {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoDevolucion | ''>('');
  const [motivo, setMotivo] = useState<MotivoDevolucion | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [numeroSeleccionado, setNumeroSeleccionado] = useState<number | null>(null);

  const seleccionada = devoluciones.find((d) => d.numeroSeguimiento === numeroSeleccionado) ?? null;

  const busqueda = texto.trim().toLowerCase();
  const filtradas = devoluciones.filter((d) => {
    const dia = d.fechaSolicitud.slice(0, 10);
    const coincideTexto =
      busqueda === '' ||
      String(d.numeroSeguimiento) === busqueda ||
      String(d.numeroPedido).padStart(4, '0').includes(busqueda) ||
      nombreUsuario(d.rutCliente).toLowerCase().includes(busqueda) ||
      d.rutCliente.includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || d.estado === estado) &&
      (motivo === '' || d.motivo === motivo) &&
      (desde === '' || dia >= desde) &&
      (hasta === '' || dia <= hasta)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  const filtrosActivos = [motivo, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setMotivo('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const cuantas = (e: EstadoDevolucion) => devoluciones.filter((d) => d.estado === e).length;
  const unidades = (d: Devolucion) => d.items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="space-y-6">
      {/* Botones rápidos por estado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS_DEVOLUCION] as (EstadoDevolucion | '')[]).map((e) => (
          <Button
            key={e || 'TODAS'}
            size="sm"
            variant={estado === e ? 'default' : 'outline'}
            disabled={estado === e}
            onClick={() => {
              setEstado(e);
              setPagina(1);
            }}
          >
            {e === '' ? `Todas (${devoluciones.length})` : `${textoEnum(e)}s (${cuantas(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por N° de seguimiento, N° de pedido o cliente..."
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
              Motivo
              <select
                className={estiloCampo}
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value as MotivoDevolucion | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {(Object.keys(NOMBRE_MOTIVO) as MotivoDevolucion[]).map((m) => (
                  <option key={m} value={m}>{NOMBRE_MOTIVO[m]}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Solicitada desde
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
              Solicitada hasta
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">N° Seguim.</TableHead>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Solicitada</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ninguna devolución coincide con los filtros.' : 'No hay solicitudes de devolución.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((d) => (
            <TableRow key={d.numeroSeguimiento}>
              <TableCell>{d.numeroSeguimiento}</TableCell>
              <TableCell>#{String(d.numeroPedido).padStart(4, '0')}</TableCell>
              <TableCell>{nombreUsuario(d.rutCliente)}</TableCell>
              <TableCell className="max-w-xs">
                <span className="block truncate">{d.items.map((i) => i.nombreProducto).join(', ')}</span>
                <span className="text-xs text-muted-foreground">
                  {unidades(d)} {unidades(d) === 1 ? 'unidad' : 'unidades'}
                </span>
              </TableCell>
              <TableCell>{NOMBRE_MOTIVO[d.motivo]}</TableCell>
              <TableCell className="text-right">{pesos(montoDevolucion(d))}</TableCell>
              <TableCell>{fechaHora(d.fechaSolicitud)}</TableCell>
              <TableCell><EstadoDevolucionBadge estado={d.estado} /></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => setNumeroSeleccionado(d.numeroSeguimiento)}>
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
        totalRegistros={filtradas.length}
        nombre={['devolución', 'devoluciones']}
        onCambiar={setPagina}
      />

      <DevolucionDialog
        devolucion={seleccionada}
        nombreUsuario={nombreUsuario}
        onCerrar={() => setNumeroSeleccionado(null)}
        onCambio={recargar}
      />
    </div>
  );
};

export default TablaDevoluciones;
