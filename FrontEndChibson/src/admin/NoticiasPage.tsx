import { useState } from 'react';
import { ChevronDown, Filter, ImageOff, Pencil, Plus, RefreshCw, Search } from 'lucide-react';

import useNoticias from '../hooks/useNoticias';
import NoticiaService, { type CategoriaNoticia, type EstadoNoticia, type Noticia } from '../services/noticia.service';
import { estiloCampo, fechaDeHoy, textoEnum } from '../utils/formato';
import { mensajeError } from '../utils/errores';

import { Paginacion } from './components/Paginacion';
import { ESTADOS_NOTICIA, EstadoNoticiaBadge, NOMBRE_CATEGORIA, NoticiaDialog } from './components/NoticiaDialog';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;

// "2026-11-08" → "08-11-2026" (sin new Date, que lo tomaría como UTC y mostraría el día anterior)
const fechaDia = (fecha: string) => fecha.split('-').reverse().join('-');

export const NoticiasPage = () => {
  // 1. Datos del backend
  const { noticias, loading, error, recargar } = useNoticias();

  // 2. Filtros, página y modal
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoNoticia | ''>('');
  const [categoria, setCategoria] = useState<CategoriaNoticia | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Noticia | null>(null);
  const [cambiandoId, setCambiandoId] = useState<number | null>(null);
  const [errorEstado, setErrorEstado] = useState('');

  // 3. Buscador y filtros (las fechas filtran por fecha de publicación)
  const busqueda = texto.trim().toLowerCase();
  const filtradas = noticias.filter((n) => {
    const dia = n.fechaPublicacion ?? '';
    return (
      (busqueda === '' || n.titulo.toLowerCase().includes(busqueda)) &&
      (estado === '' || n.estado === estado) &&
      (categoria === '' || n.categoria === categoria) &&
      (desde === '' || (dia !== '' && dia >= desde)) &&
      (hasta === '' || (dia !== '' && dia <= hasta))
    );
  });

  // 4. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // El estado se elige con los botones rápidos, no en el desplegable
  const filtrosActivos = [categoria, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setCategoria('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const cuantas = (e: EstadoNoticia) => noticias.filter((n) => n.estado === e).length;

  // 5. Modal: null = agregar, con noticia = modificar
  const abrirModal = (noticia: Noticia | null) => {
    setEditando(noticia);
    setModalAbierto(true);
  };
  const alTerminar = () => {
    setModalAbierto(false);
    void recargar();
  };

  // 6. Activar / desactivar desde la tabla (no borra nada, así que no pide confirmación)
  const cambiarEstado = async (n: Noticia) => {
    setCambiandoId(n.idNoticia);
    setErrorEstado('');
    try {
      if (n.estado === 'ACTIVADA') await NoticiaService.desactivar(n.idNoticia);
      else await NoticiaService.activar(n.idNoticia);
      await recargar();
    } catch (err) {
      setErrorEstado(mensajeError(err, 'No se pudo cambiar el estado de la noticia.'));
    } finally {
      setCambiandoId(null);
    }
  };

  const textoBotonEstado = (e: EstadoNoticia) => (e === 'ACTIVADA' ? 'Desactivar' : e === 'BORRADOR' ? 'Publicar' : 'Activar');

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Noticias</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Noticias y novedades de la tienda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => abrirModal(null)}>
            <Plus /> Agregar noticia
          </Button>
        </div>
      </div>

      {/* Botones rápidos por estado: el activo queda destacado y deshabilitado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS_NOTICIA] as (EstadoNoticia | '')[]).map((e) => (
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
            {e === '' ? `Todas (${noticias.length})` : e === 'BORRADOR' ? `Borradores (${cuantas(e)})` : `${textoEnum(e)}s (${cuantas(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título..."
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
                  setCategoria(e.target.value as CategoriaNoticia | '');
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {(Object.keys(NOMBRE_CATEGORIA) as CategoriaNoticia[]).map((c) => (
                  <option key={c} value={c}>{NOMBRE_CATEGORIA[c]}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Publicada desde
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
              Publicada hasta
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
          No se pudieron cargar las noticias. Revisa que el gateway, ms-contenido y ms-usuarios estén encendidos.
        </p>
      )}
      {errorEstado && <p className="text-red-600">{errorEstado}</p>}

      {/* Tabla: eliminar está dentro del modal de modificar */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead className="w-20">Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Publicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ninguna noticia coincide con los filtros.' : 'No hay noticias registradas.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((n) => (
            <TableRow key={n.idNoticia}>
              <TableCell>{n.idNoticia}</TableCell>
              <TableCell>
                {n.imagenUrl ? (
                  <img src={n.imagenUrl} alt="" className="h-10 w-16 rounded object-cover" />
                ) : (
                  <span className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ImageOff className="size-4" />
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate font-medium">{n.titulo}</TableCell>
              <TableCell>{NOMBRE_CATEGORIA[n.categoria]}</TableCell>
              <TableCell>
                {n.fechaPublicacion ? fechaDia(n.fechaPublicacion) : <span className="text-muted-foreground">Sin publicar</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <EstadoNoticiaBadge estado={n.estado} />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cambiandoId === n.idNoticia}
                    onClick={() => void cambiarEstado(n)}
                  >
                    {cambiandoId === n.idNoticia ? '...' : textoBotonEstado(n.estado)}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" aria-label={`Modificar noticia ${n.idNoticia}`} onClick={() => abrirModal(n)}>
                  <Pencil />
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
        nombre={['noticia', 'noticias']}
        onCambiar={setPagina}
      />

      <NoticiaDialog
        abierto={modalAbierto}
        noticia={editando}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={alTerminar}
        onEliminada={alTerminar}
      />
    </section>
  );
};

export default NoticiasPage;
