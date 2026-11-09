import { useState } from 'react';
import { ChevronDown, Filter, MessageSquare, RefreshCw, Search } from 'lucide-react';

import useTickets from '../hooks/useTickets';
import useUsuarios from '../hooks/useUsuarios';
import type { CategoriaTicket, EstadoTicket } from '../services/ticket.service';
import { estiloCampo, fechaDeHoy, fechaHora, textoEnum } from '../utils/formato';

import { Paginacion } from './components/Paginacion';
import { ESTADOS_TICKET, EstadoBadge, TicketDialog } from './components/TicketDialog';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;
const CATEGORIAS: CategoriaTicket[] = ['DESPACHO', 'GARANTIA', 'PAGO', 'PEDIDO', 'OTRO'];

export const SoportePage = () => {
  // 1. Datos del backend
  const { tickets, loading, error, recargar } = useTickets();
  const { usuarios } = useUsuarios();

  // 2. Filtros, página y modal
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoTicket | ''>('');
  const [categoria, setCategoria] = useState<CategoriaTicket | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [numeroSeleccionado, setNumeroSeleccionado] = useState<number | null>(null);

  // 3. RUT → nombre, para saber qué administrador respondió cada mensaje
  const nombres = new Map(usuarios.map((u) => [u.rut, `${u.nombres} ${u.primerApellido}`]));
  const nombreAdmin = (rut: string) => nombres.get(rut) ?? rut;

  // 4. Buscador y filtros
  const busqueda = texto.trim().toLowerCase();
  const filtrados = tickets.filter((t) => {
    const dia = t.fechaCreacion.slice(0, 10);
    const coincideTexto =
      busqueda === '' ||
      String(t.numeroTicket).padStart(4, '0').includes(busqueda) ||
      (t.nombreCliente ?? '').toLowerCase().includes(busqueda) ||
      t.rutCliente.includes(busqueda) ||
      t.asunto.toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || t.estado === estado) &&
      (categoria === '' || t.categoria === categoria) &&
      (desde === '' || dia >= desde) &&
      (hasta === '' || dia <= hasta)
    );
  });

  // 5. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // El estado se elige con los botones rápidos, no en el desplegable
  const filtrosActivos = [categoria, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setCategoria('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  // Contador por estado para los botones rápidos
  const cuantos = (e: EstadoTicket) => tickets.filter((t) => t.estado === e).length;

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Soporte</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Tickets de los clientes</p>
        </div>
        <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Botones rápidos por estado: el que está activo queda destacado y deshabilitado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS_TICKET] as (EstadoTicket | '')[]).map((e) => (
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
            {e === '' ? `Todos (${tickets.length})` : `${textoEnum(e)} (${cuantos(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por N° de ticket, cliente, RUT o asunto..."
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
              Categoría
              <select
                className={estiloCampo}
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value as CategoriaTicket | '');
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{textoEnum(c)}</option>
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

      {error && (
        <p className="text-red-600">
          No se pudieron cargar los tickets. Revisa que el gateway, ms-soporte y ms-usuarios estén encendidos.
        </p>
      )}

      {/* Tabla: responder, cambiar estado y eliminar se hacen dentro del modal */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">N° Ticket</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ningún ticket coincide con los filtros.' : 'No hay tickets registrados.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((t) => (
            <TableRow key={t.numeroTicket}>
              <TableCell>{String(t.numeroTicket).padStart(4, '0')}</TableCell>
              <TableCell>{t.nombreCliente ?? t.rutCliente}</TableCell>
              <TableCell className="max-w-xs truncate">{t.asunto}</TableCell>
              <TableCell>{textoEnum(t.categoria)}</TableCell>
              <TableCell>{fechaHora(t.fechaCreacion)}</TableCell>
              <TableCell>
                <EstadoBadge estado={t.estado} />
                {t.mensajes.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t.mensajes.length} {t.mensajes.length === 1 ? 'respuesta' : 'respuestas'}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => setNumeroSeleccionado(t.numeroTicket)}>
                  <MessageSquare /> Gestionar
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
        nombre={['ticket', 'tickets']}
        onCambiar={setPagina}
      />

      <TicketDialog
        numero={numeroSeleccionado}
        nombreAdmin={nombreAdmin}
        onCerrar={() => setNumeroSeleccionado(null)}
        onActualizado={() => void recargar()}
        onEliminado={() => {
          setNumeroSeleccionado(null);
          void recargar();
        }}
      />
    </section>
  );
};

export default SoportePage;
