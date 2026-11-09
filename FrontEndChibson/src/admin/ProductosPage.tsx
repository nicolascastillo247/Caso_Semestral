import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, FilePlus2, FileText, Filter, Pencil, Plus, RefreshCw, Search } from 'lucide-react';

import useProductos from '../hooks/useProductos';
import useResenas from '../hooks/useResenas';
import ProductoService, { type Categoria, type EstadoProducto, type Producto } from '../services/producto.service';
import { estiloCampo, fechaDeHoy, pesos, textoEnum } from '../utils/formato';
import { mensajeError } from '../utils/errores';

import { Paginacion } from './components/Paginacion';
import { Estrellas } from './components/Estrellas';
import { CATEGORIAS, EstadoProductoBadge, NOMBRE_CATEGORIA, ProductoDialog } from './components/ProductoDialog';
import { FichaTecnicaDialog } from './components/FichaTecnicaDialog';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;
const ESTADOS: EstadoProducto[] = ['ACTIVO', 'INACTIVO'];
type FiltroStock = '' | 'BAJO' | 'AGOTADO';

export const ProductosPage = () => {
  // 1. Datos del backend
  const { productos, loading, error, recargar } = useProductos();
  const { resenas } = useResenas();

  // 2. Filtros, página y modales
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoProducto | ''>('');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [stock, setStock] = useState<FiltroStock>('');
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [fichaDe, setFichaDe] = useState<Producto | null>(null);
  const [cambiandoSku, setCambiandoSku] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState('');

  // 3. Calificación promedio por SKU, solo con reseñas aprobadas (las que ve el público)
  const calificaciones = new Map<string, { suma: number; cantidad: number }>();
  for (const r of resenas) {
    if (r.estado !== 'APROBADA') continue;
    const actual = calificaciones.get(r.sku) ?? { suma: 0, cantidad: 0 };
    calificaciones.set(r.sku, { suma: actual.suma + r.calificacion, cantidad: actual.cantidad + 1 });
  }

  // 4. Buscador y filtros
  const busqueda = texto.trim().toLowerCase();
  const filtrados = productos.filter((p) => {
    const coincideTexto =
      busqueda === '' ||
      p.sku.toLowerCase().includes(busqueda) ||
      p.modelo.toLowerCase().includes(busqueda) ||
      p.marca.toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || p.estado === estado) &&
      (categoria === '' || p.categoria === categoria) &&
      (stock === '' || (stock === 'AGOTADO' ? p.agotado : p.bajoStock))
    );
  });

  // 5. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // El estado se elige con los botones rápidos, no en el desplegable
  const filtrosActivos = [categoria, stock].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setCategoria('');
    setStock('');
    setPagina(1);
  };

  const cuantos = (e: EstadoProducto) => productos.filter((p) => p.estado === e).length;

  // 6. Modales
  const abrirModal = (producto: Producto | null) => {
    setEditando(producto);
    setModalAbierto(true);
  };
  const alTerminar = () => {
    setModalAbierto(false);
    void recargar();
  };

  // 7. Desactivar / reactivar desde la tabla. No borra nada, así que no pide confirmación.
  const cambiarEstado = async (p: Producto) => {
    setCambiandoSku(p.sku);
    setErrorEstado('');
    try {
      if (p.estado === 'ACTIVO') await ProductoService.desactivar(p.sku);
      else await ProductoService.reactivar(p.sku);
      await recargar();
    } catch (err) {
      setErrorEstado(mensajeError(err, 'No se pudo cambiar el estado del producto.'));
    } finally {
      setCambiandoSku(null);
    }
  };

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Catálogo, stock y fichas técnicas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => abrirModal(null)}>
            <Plus /> Agregar producto
          </Button>
        </div>
      </div>

      {/* Botones rápidos por estado: el activo queda destacado y deshabilitado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS] as (EstadoProducto | '')[]).map((e) => (
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
            {e === '' ? `Todos (${productos.length})` : `${textoEnum(e)}s (${cuantos(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por SKU, modelo o marca..."
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
                  setCategoria(e.target.value as Categoria | '');
                  setPagina(1);
                }}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{NOMBRE_CATEGORIA[c]}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Stock
              <select
                className={estiloCampo}
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value as FiltroStock);
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                <option value="BAJO">Stock bajo (incluye agotados)</option>
                <option value="AGOTADO">Agotados</option>
              </select>
            </label>

            <Button variant="outline" className="w-full" onClick={limpiarFiltros} disabled={filtrosActivos === 0}>
              Limpiar filtros
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <p className="text-red-600">No se pudieron cargar los productos. Revisa que el gateway, ms-productos y ms-usuarios estén encendidos.</p>
      )}
      {errorEstado && <p className="text-red-600">{errorEstado}</p>}

      {/* Tabla: eliminar está dentro del modal de modificar */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Ficha técnica</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ningún producto coincide con los filtros.' : 'No hay productos registrados.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((p) => {
            const nota = calificaciones.get(p.sku);
            return (
              <TableRow key={p.sku}>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={p.imagenUrl} alt="" className="size-10 shrink-0 rounded border object-contain" />
                    <div>
                      <span className="block font-medium">{p.modelo}</span>
                      <span className="text-xs text-muted-foreground">{p.marca}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{NOMBRE_CATEGORIA[p.categoria]}</TableCell>
                <TableCell className="text-right">{pesos(p.precio)}</TableCell>
                <TableCell className="text-right">
                  <span className={p.agotado ? 'font-semibold text-red-600' : p.bajoStock ? 'font-semibold text-amber-600' : ''}>
                    {p.stockDisponible}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {p.agotado ? 'Agotado' : p.bajoStock ? 'Stock bajo' : `mín. ${p.stockMinimo}`}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setFichaDe(p)}>
                    {p.fichaTecnica ? <FileText /> : <FilePlus2 />}
                    {p.fichaTecnica ? `${p.especificaciones.length} datos` : 'Agregar'}
                  </Button>
                </TableCell>
                <TableCell>
                  {/* Lleva a Reseñas con el SKU ya buscado */}
                  <Link to={`/admin/resenas?q=${p.sku}`} className="inline-flex items-center gap-1 text-sm hover:underline" title="Ver reseñas">
                    {nota ? (
                      <>
                        <Estrellas valor={Math.round(nota.suma / nota.cantidad)} />
                        <span>{(nota.suma / nota.cantidad).toFixed(1).replace('.', ',')}</span>
                        <span className="text-muted-foreground">({nota.cantidad})</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Sin reseñas</span>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EstadoProductoBadge estado={p.estado} />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cambiandoSku === p.sku}
                      onClick={() => void cambiarEstado(p)}
                    >
                      {cambiandoSku === p.sku ? '...' : p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon" title="Modificar" aria-label={`Modificar ${p.sku}`} onClick={() => abrirModal(p)}>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={filtrados.length}
        nombre={['producto', 'productos']}
        onCambiar={setPagina}
      />

      <ProductoDialog abierto={modalAbierto} producto={editando} onCerrar={() => setModalAbierto(false)} onTerminado={alTerminar} />
      <FichaTecnicaDialog
        producto={fichaDe}
        onCerrar={() => setFichaDe(null)}
        onGuardado={() => {
          setFichaDe(null);
          void recargar();
        }}
      />
    </section>
  );
};

export default ProductosPage;
