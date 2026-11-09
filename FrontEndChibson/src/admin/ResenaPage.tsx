import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronDown, Filter, MessageSquareReply, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

import useResenas from '../hooks/useResenas';
import type { EstadoResena } from '../services/resena.service';
import { estiloCampo, fechaDeHoy, soloFecha, textoEnum } from '../utils/formato';

import { Paginacion } from './components/Paginacion';
import { Estrellas } from './components/Estrellas';
import { ESTADOS_RESENA, EstadoResenaBadge, ResenaDialog } from './components/ResenaDialog';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;

export const ResenaPage = () => {
  // 1. Datos del backend
  const { resenas, loading, error, recargar } = useResenas();

  // 2. Filtros, página y modal
  // Si viene de Productos (/admin/resenas?q=GTR-0001), el buscador parte con ese SKU
  const [params] = useSearchParams();
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const [estado, setEstado] = useState<EstadoResena | ''>('');
  const [calificacion, setCalificacion] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [idSeleccionada, setIdSeleccionada] = useState<number | null>(null);

  // El modal toma la reseña desde la lista: al recargar, se actualiza solo
  const seleccionada = resenas.find((r) => r.idResena === idSeleccionada) ?? null;

  // 3. Buscador y filtros
  const busqueda = texto.trim().toLowerCase();
  const filtradas = resenas.filter((r) => {
    const dia = r.fecha.slice(0, 10);
    const coincideTexto =
      busqueda === '' ||
      r.modeloProducto.toLowerCase().includes(busqueda) ||
      r.sku.toLowerCase().includes(busqueda) ||
      r.nombreCliente.toLowerCase().includes(busqueda) ||
      r.titulo.toLowerCase().includes(busqueda) ||
      (r.comentario ?? '').toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || r.estado === estado) &&
      (calificacion === '' || r.calificacion === Number(calificacion)) &&
      (desde === '' || dia >= desde) &&
      (hasta === '' || dia <= hasta)
    );
  });

  // 4. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // El estado se elige con los botones rápidos, no en el desplegable
  const filtrosActivos = [calificacion, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setCalificacion('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const cuantas = (e: EstadoResena) => resenas.filter((r) => r.estado === e).length;

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reseñas</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Moderación de reseñas de productos</p>
        </div>
        <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Botones rápidos por estado: el activo queda destacado y deshabilitado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS_RESENA] as (EstadoResena | '')[]).map((e) => (
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
            {e === '' ? `Todas (${resenas.length})` : `${textoEnum(e)}s (${cuantas(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por producto, SKU, cliente o comentario..."
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
              Calificación
              <select
                className={estiloCampo}
                value={calificacion}
                onChange={(e) => {
                  setCalificacion(e.target.value);
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'estrella' : 'estrellas'}</option>
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
          No se pudieron cargar las reseñas. Revisa que el gateway, ms-productos y ms-usuarios estén encendidos.
        </p>
      )}

      {/* Tabla: moderar, responder y eliminar se hacen dentro del modal */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Reseña</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ninguna reseña coincide con los filtros.' : 'No hay reseñas registradas.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((r) => (
            <TableRow key={r.idResena}>
              <TableCell>
                {r.modeloProducto}
                <span className="block text-xs text-muted-foreground">{r.sku}</span>
              </TableCell>
              <TableCell>{r.nombreCliente}</TableCell>
              <TableCell><Estrellas valor={r.calificacion} /></TableCell>
              <TableCell className="max-w-xs">
                <span className="block truncate font-medium">{r.titulo}</span>
                {r.comentario && <span className="block truncate text-xs text-muted-foreground">{r.comentario}</span>}
              </TableCell>
              <TableCell>{soloFecha(r.fecha)}</TableCell>
              <TableCell>
                <EstadoResenaBadge estado={r.estado} />
                {r.respuestaAdmin && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground" title="Tiene respuesta de la tienda">
                    <MessageSquareReply className="size-3" /> Respondida
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => setIdSeleccionada(r.idResena)}>
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
        nombre={['reseña', 'reseñas']}
        onCambiar={setPagina}
      />

      <ResenaDialog
        resena={seleccionada}
        onCerrar={() => setIdSeleccionada(null)}
        onCambio={recargar}
        onEliminada={() => {
          setIdSeleccionada(null);
          void recargar();
        }}
      />
    </section>
  );
};

export default ResenaPage;
