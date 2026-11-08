import { useState } from 'react';
import { ChevronDown, Eye, Filter, RefreshCw, Search } from 'lucide-react';

import useAcciones from '../hooks/useAcciones';
import useUsuarios from '../hooks/useUsuarios';
import type { TipoAccion } from '../services/accion.service';

import { Button, buttonVariants } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog';

const FILAS_POR_PAGINA = 10;
const TIPOS: TipoAccion[] = ['CREAR', 'MODIFICAR', 'ELIMINAR', 'ACTIVAR', 'DESACTIVAR'];

// Color del Badge según el tipo de acción
const colorTipo = (tipo: TipoAccion) => {
  if (tipo === 'ELIMINAR') return 'destructive';
  if (tipo === 'CREAR') return 'default';
  if (tipo === 'MODIFICAR') return 'secondary';
  return 'outline'; // ACTIVAR y DESACTIVAR
};

// "MODIFICAR" → "Modificar"
const textoTipo = (tipo: string) => tipo.charAt(0) + tipo.slice(1).toLowerCase();

// "2026-11-07T21:19:05" → "07-11-2026, 21:19:05"
const formatearFecha = (fecha: string) => new Date(fecha).toLocaleString('es-CL');

// "sábado, 7 de noviembre de 2026" → "Sábado, 7 de noviembre de 2026"
const hoy = new Date().toLocaleDateString('es-CL', { dateStyle: 'full' });
const fechaDeHoy = hoy.charAt(0).toUpperCase() + hoy.slice(1);

// Estilo de los <select> y <input type="date"> para que combinen con el Input de shadcn
const estiloCampo =
  'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const HistorialPage = () => {
  // 1. Datos del backend
  const { acciones, loading, error, recargar } = useAcciones();
  const { usuarios } = useUsuarios();

  // 2. Filtros y página actual
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<TipoAccion | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);

  // 3. Diccionario RUT → nombre del administrador (si no lo encuentra, muestra el RUT)
  const nombres = new Map(usuarios.map((u) => [u.rut, `${u.nombres} ${u.primerApellido}`]));
  const nombreAdmin = (rut: string) => nombres.get(rut) ?? rut;

  // 4. Aplicar buscador y filtros
  const busqueda = texto.trim().toLowerCase();
  const filtradas = acciones.filter((a) => {
    const dia = a.fecha.slice(0, 10); // "2026-11-07", mismo formato que <input type="date">
    const coincideTexto =
      busqueda === '' ||
      nombreAdmin(a.rutAdministrador).toLowerCase().includes(busqueda) ||
      a.rutAdministrador.includes(busqueda) ||
      a.descripcion.toLowerCase().includes(busqueda) ||
      a.modulo.toLowerCase().includes(busqueda);
    const coincideTipo = tipo === '' || a.tipo === tipo;
    const coincideDesde = desde === '' || dia >= desde;
    const coincideHasta = hasta === '' || dia <= hasta;
    return coincideTexto && coincideTipo && coincideDesde && coincideHasta;
  });

  // 5. Paginación: solo se muestran 10 filas de la página actual
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice(
    (paginaActual - 1) * FILAS_POR_PAGINA,
    paginaActual * FILAS_POR_PAGINA,
  );

  // Cuántos filtros del desplegable están en uso (se muestra en el botón "Filtros")
  const filtrosActivos = [tipo, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setTipo('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Historial</h1>
          <p className="text-sm text-muted-foreground">
            {fechaDeHoy} — Registro de acciones de administradores
          </p>
        </div>
        <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Buscador y botón de filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por administrador, descripción o módulo..."
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        {/* Los filtros van en un Popover: se despliega al apretar "Filtros" y no se cierra al usar los campos */}
        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: 'default' })}>
            <Filter />
            Filtros
            {filtrosActivos > 0 && (
              <span className="ml-1 rounded-full bg-background px-1.5 text-xs text-foreground">
                {filtrosActivos}
              </span>
            )}
            <ChevronDown />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              Acción
              <select
                className={estiloCampo}
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as TipoAccion | '');
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{textoTipo(t)}</option>
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
          No se pudo cargar el historial. Revisa que el gateway y ms-usuarios estén encendidos.
        </p>
      )}

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Administrador</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ninguna acción coincide con los filtros.' : 'No hay acciones registradas.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((accion) => (
            <TableRow key={accion.idRegistro}>
              <TableCell>{accion.idRegistro}</TableCell>
              <TableCell>{nombreAdmin(accion.rutAdministrador)}</TableCell>
              <TableCell>
                <Badge variant={colorTipo(accion.tipo)}>{textoTipo(accion.tipo)}</Badge>
              </TableCell>
              <TableCell className="max-w-md truncate">{accion.descripcion}</TableCell>
              <TableCell>{formatearFecha(accion.fecha)}</TableCell>

              <TableCell className="text-right">
                {/* Solo lectura: el historial no tiene editar ni eliminar */}
                <Dialog>
                  <DialogTrigger
                    className={buttonVariants({ variant: 'outline', size: 'icon' })}
                    aria-label={`Ver detalle de la acción ${accion.idRegistro}`}
                  >
                    <Eye />
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Detalle de la acción #{accion.idRegistro}</DialogTitle>
                      <DialogDescription>{accion.descripcion}</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p><strong>Administrador:</strong> {nombreAdmin(accion.rutAdministrador)}</p>
                      <p><strong>RUT:</strong> {accion.rutAdministrador}</p>
                      <p>
                        <strong>Acción:</strong>{' '}
                        <Badge variant={colorTipo(accion.tipo)}>{textoTipo(accion.tipo)}</Badge>
                      </p>
                      <p><strong>Módulo:</strong> {accion.modulo}</p>
                      <p className="col-span-2"><strong>Fecha:</strong> {formatearFecha(accion.fecha)}</p>
                    </div>

                    {accion.cambios.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Esta acción no registra cambios de campos.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campo</TableHead>
                            <TableHead>Valor anterior</TableHead>
                            <TableHead>Valor nuevo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accion.cambios.map((cambio) => (
                            <TableRow key={cambio.idDetalle}>
                              <TableCell className="font-medium">{cambio.campo}</TableCell>
                              <TableCell>{cambio.valorAnterior || '—'}</TableCell>
                              <TableCell>{cambio.valorNuevo || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtradas.length} {filtradas.length === 1 ? 'acción' : 'acciones'}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={paginaActual === 1}
            onClick={() => setPagina(paginaActual - 1)}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === paginaActual ? 'default' : 'outline'}
              size="sm"
              disabled={n === paginaActual}
              onClick={() => setPagina(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPagina(paginaActual + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HistorialPage;
