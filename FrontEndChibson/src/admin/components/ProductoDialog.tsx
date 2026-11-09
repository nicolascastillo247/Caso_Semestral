import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import ProductoService, { type Categoria, type EstadoProducto, type Producto } from '../../services/producto.service';
import { estiloCampo, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  GUITARRA: 'Guitarra',
  BAJO: 'Bajo',
  PERCUSION: 'Percusión',
  TECLAS: 'Teclas',
  VIENTO: 'Viento',
  CUERDAS: 'Cuerdas',
};
export const CATEGORIAS = Object.keys(NOMBRE_CATEGORIA) as Categoria[];

export const EstadoProductoBadge = ({ estado }: { estado: EstadoProducto }) => (
  <Badge
    variant="outline"
    className={estado === 'ACTIVO' ? 'border-transparent bg-green-100 text-green-800' : 'border-transparent bg-zinc-200 text-zinc-700'}
  >
    {textoEnum(estado)}
  </Badge>
);

// ---------- Formulario ----------
// Se monta cada vez que se abre el modal, así empieza con los datos del producto (o vacío al crear).

interface FormularioProps {
  producto: Producto | null;
  onCerrar: () => void;
  onTerminado: () => void;
}

const FormularioProducto = ({ producto, onCerrar, onTerminado }: FormularioProps) => {
  const editando = producto !== null;

  const [modelo, setModelo] = useState(producto?.modelo ?? '');
  const [marca, setMarca] = useState(producto?.marca ?? '');
  const [categoria, setCategoria] = useState<Categoria>(producto?.categoria ?? 'GUITARRA');
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : '');
  const [stockDisponible, setStockDisponible] = useState(producto ? String(producto.stockDisponible) : '');
  const [stockMinimo, setStockMinimo] = useState(producto ? String(producto.stockMinimo) : '5');
  const [imagenUrl, setImagenUrl] = useState(producto?.imagenUrl ?? '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
  const [activo, setActivo] = useState(true);
  const [imagenRota, setImagenRota] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async () => {
    if (modelo.trim() === '' || marca.trim() === '' || imagenUrl.trim() === '') {
      setError('El modelo, la marca y la imagen son obligatorios.');
      return;
    }
    if (!(Number(precio) > 0)) {
      setError('El precio debe ser mayor que cero.');
      return;
    }
    if (stockDisponible === '' || Number(stockDisponible) < 0 || stockMinimo === '' || Number(stockMinimo) < 0) {
      setError('El stock disponible y el stock mínimo no pueden quedar vacíos ni ser negativos.');
      return;
    }
    const datos = {
      modelo: modelo.trim(),
      marca: marca.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio),
      categoria,
      imagenUrl: imagenUrl.trim(),
      stockDisponible: Number(stockDisponible),
      stockMinimo: Number(stockMinimo),
    };
    setGuardando(true);
    setError('');
    try {
      if (editando) await ProductoService.actualizar(producto.sku, datos);
      else await ProductoService.crear({ ...datos, activo });
      onTerminado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el producto.'));
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!editando) return;
    setGuardando(true);
    setError('');
    try {
      await ProductoService.eliminar(producto.sku);
      onTerminado();
    } catch (err) {
      // Si ya se vendió, el backend pide desactivarlo en vez de eliminarlo
      setError(mensajeError(err, 'No se pudo eliminar el producto.'));
      setConfirmando(false);
      setGuardando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editando ? `Modificar ${producto.sku}` : 'Agregar producto'}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          {editando ? (
            <>Estado actual: <EstadoProductoBadge estado={producto.estado} /></>
          ) : (
            'El SKU se genera solo según la categoría (por ejemplo GTR-0001).'
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Modelo
            <Input value={modelo} placeholder="Les Paul Standard" onChange={(e) => setModelo(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Marca
            <Input value={marca} placeholder="Gibson" onChange={(e) => setMarca(e.target.value)} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Categoría
            <select
              className={estiloCampo}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{NOMBRE_CATEGORIA[c]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Precio (CLP, IVA incluido)
            <Input type="number" min={1} value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            {editando ? 'Stock disponible' : 'Stock inicial'}
            <Input type="number" min={0} value={stockDisponible} onChange={(e) => setStockDisponible(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Stock mínimo
            <Input type="number" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
            <span className="text-xs text-muted-foreground">Con esta cantidad o menos aparece como "stock bajo".</span>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          URL de la imagen
          <Input
            value={imagenUrl}
            placeholder="https://..."
            onChange={(e) => {
              setImagenUrl(e.target.value);
              setImagenRota(false);
            }}
          />
        </label>
        {imagenUrl.trim() !== '' && (
          imagenRota ? (
            <p className="text-xs text-red-600">No se pudo cargar la imagen de esa URL.</p>
          ) : (
            <img
              src={imagenUrl.trim()}
              alt="Vista previa"
              className="max-h-40 rounded-md border object-contain"
              onError={() => setImagenRota(true)}
            />
          )
        )}

        <label className="flex flex-col gap-1 text-sm">
          Descripción (opcional)
          <textarea
            rows={4}
            className={`${estiloCampo} h-auto py-2`}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>

        {!editando && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Publicarlo en el catálogo de inmediato
          </label>
        )}
        {editando && (
          <p className="text-xs text-muted-foreground">La ficha técnica se edita con su propio botón en la tabla.</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Eliminar solo al editar, con confirmación en dos pasos */}
        <div>
          {editando && (confirmando ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar el producto y sus reseñas?</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>Sí, eliminar</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={guardando}>Cancelar</Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmando(true)} disabled={guardando}>
              <Trash2 /> Eliminar
            </Button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
          <Button onClick={() => void guardar()} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface ProductoDialogProps {
  abierto: boolean;
  producto: Producto | null; // null = agregar
  onCerrar: () => void;
  onTerminado: () => void;
}

export const ProductoDialog = ({ abierto, producto, onCerrar, onTerminado }: ProductoDialogProps) => (
  <Dialog open={abierto} onOpenChange={(abrir: boolean) => { if (!abrir) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      {abierto && (
        <FormularioProducto key={producto?.sku ?? 'nuevo'} producto={producto} onCerrar={onCerrar} onTerminado={onTerminado} />
      )}
    </DialogContent>
  </Dialog>
);

export default ProductoDialog;
