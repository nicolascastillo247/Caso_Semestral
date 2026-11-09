import { useState } from 'react';
import { ChevronDown, Eye, FilePlus2, Filter, RefreshCw, Search } from 'lucide-react';

import useReportes from '../hooks/useReportes';
import useUsuarios from '../hooks/useUsuarios';
import type { OrigenReporte, Reporte, TipoReporte } from '../services/reporte.service';
import { estiloCampo, fechaDeHoy, fechaHora } from '../utils/formato';

import { Paginacion } from './components/Paginacion';
import { ReporteDetalle } from './components/ReporteDetalle';
import { GenerarReporteDialog } from './components/GenerarReporteDialog';
import { NOMBRE_ORIGEN, NOMBRE_PERIODO, NOMBRE_TIPO, rangoReporte } from './components/textosReporte';

import { Button, buttonVariants } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;
const TIPOS = Object.keys(NOMBRE_TIPO) as TipoReporte[];
const ORIGENES = Object.keys(NOMBRE_ORIGEN) as OrigenReporte[];

export const InformePage = () => {
  // 1. Datos del backend
  const { reportes, loading, error, recargar } = useReportes();
  const { usuarios } = useUsuarios();

  // 2. Filtros, página y modales
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<TipoReporte | ''>('');
  const [origen, setOrigen] = useState<OrigenReporte | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [generando, setGenerando] = useState(false);

  // 3. RUT → nombre del administrador. Los automáticos no tienen RUT: los generó el sistema.
  const nombres = new Map(usuarios.map((u) => [u.rut, `${u.nombres} ${u.primerApellido}`]));
  const nombreAdmin = (rut: string) => nombres.get(rut) ?? rut;
  const generadoPor = (rut: string | null) => (rut ? nombreAdmin(rut) : 'Sistema');

  // 4. Buscador y filtros (las fechas filtran por fecha de creación)
  const busqueda = texto.trim().toLowerCase();
  const filtrados = reportes.filter((r) => {
    const dia = r.fechaCreacion.slice(0, 10);
    const coincideTexto =
      busqueda === '' ||
      String(r.idReporte) === busqueda ||
      NOMBRE_TIPO[r.tipo].toLowerCase().includes(busqueda) ||
      generadoPor(r.rutAdministrador).toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (tipo === '' || r.tipo === tipo) &&
      (origen === '' || r.origen === origen) &&
      (desde === '' || dia >= desde) &&
      (hasta === '' || dia <= hasta)
    );
  });

  // 5. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  const filtrosActivos = [tipo, origen, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setTipo('');
    setOrigen('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  // 6. Al generar: se cierra el formulario, se recarga la tabla y se abre el reporte nuevo
  const alGenerar = (reporte: Reporte) => {
    setGenerando(false);
    void recargar();
    setIdSeleccionado(reporte.idReporte);
  };

  const alEliminar = () => {
    setIdSeleccionado(null);
    void recargar();
  };

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Informes</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Reportes de ventas, pedidos y productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => setGenerando(true)}>
            <FilePlus2 /> Generar reporte
          </Button>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por N°, tipo o administrador..."
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
              Tipo
              <select
                className={estiloCampo}
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as TipoReporte | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{NOMBRE_TIPO[t]}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Origen
              <select
                className={estiloCampo}
                value={origen}
                onChange={(e) => {
                  setOrigen(e.target.value as OrigenReporte | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {ORIGENES.map((o) => (
                  <option key={o} value={o}>{NOMBRE_ORIGEN[o]}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Creado desde
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
              Creado hasta
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
          No se pudieron cargar los reportes. Revisa que el gateway, ms-informes y ms-usuarios estén encendidos.
        </p>
      )}

      {/* Tabla: sin botón de eliminar, eso está dentro del modal "Ver" */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">N°</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Generado por</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ningún reporte coincide con los filtros.' : 'No hay reportes guardados.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((r) => (
            <TableRow key={r.idReporte}>
              <TableCell>{r.idReporte}</TableCell>
              <TableCell className="font-medium">{NOMBRE_TIPO[r.tipo]}</TableCell>
              <TableCell>
                {NOMBRE_PERIODO[r.periodo]}
                <span className="block text-xs text-muted-foreground">{rangoReporte(r)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={r.origen === 'MANUAL' ? 'secondary' : 'outline'}>{NOMBRE_ORIGEN[r.origen]}</Badge>
              </TableCell>
              <TableCell>{generadoPor(r.rutAdministrador)}</TableCell>
              <TableCell>{fechaHora(r.fechaCreacion)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Ver reporte ${r.idReporte}`}
                  onClick={() => setIdSeleccionado(r.idReporte)}
                >
                  <Eye />
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
        nombre={['reporte', 'reportes']}
        onCambiar={setPagina}
      />

      {/* Modales */}
      <ReporteDetalle
        id={idSeleccionado}
        nombreAdmin={nombreAdmin}
        onCerrar={() => setIdSeleccionado(null)}
        onEliminado={alEliminar}
      />
      <GenerarReporteDialog abierto={generando} onCerrar={() => setGenerando(false)} onGenerado={alGenerar} />
    </section>
  );
};

export default InformePage;
