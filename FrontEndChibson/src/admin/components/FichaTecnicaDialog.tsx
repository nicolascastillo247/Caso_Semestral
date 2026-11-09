import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import ProductoService, { type Producto } from '../../services/producto.service';
import { fechaHora } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

interface Fila {
  clave: string;
  valor: string;
}

// "cuerpo:caoba;trastes:22" → [{clave:'cuerpo', valor:'caoba'}, {clave:'trastes', valor:'22'}]
const aFilas = (texto: string | null): Fila[] => {
  if (!texto) return [{ clave: '', valor: '' }];
  return texto
    .split(';')
    .filter((s) => s.trim() !== '')
    .map((s) => {
      const [clave = '', ...resto] = s.split(':');
      return { clave: clave.trim(), valor: resto.join(':').trim() };
    });
};

// Al revés: las filas vuelven al formato que guarda el backend
const aTexto = (filas: Fila[]) =>
  filas
    .filter((f) => f.clave.trim() !== '' || f.valor.trim() !== '')
    .map((f) => `${f.clave.trim()}:${f.valor.trim()}`)
    .join(';');

// ---------- Editor ----------

interface EditorProps {
  producto: Producto;
  onCerrar: () => void;
  onGuardado: () => void;
}

const EditorFicha = ({ producto, onCerrar, onGuardado }: EditorProps) => {
  const tieneFicha = producto.fichaTecnica !== null;
  const [filas, setFilas] = useState<Fila[]>(aFilas(producto.fichaTecnica));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (i: number, campo: keyof Fila, valor: string) =>
    setFilas(filas.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));

  const guardar = async () => {
    const usadas = filas.filter((f) => f.clave.trim() !== '' || f.valor.trim() !== '');
    if (usadas.length === 0) {
      setError('Agrega al menos una especificación.');
      return;
    }
    if (usadas.some((f) => f.clave.trim() === '' || f.valor.trim() === '')) {
      setError('Cada especificación necesita nombre y valor.');
      return;
    }
    // ":" y ";" son los separadores del formato, no pueden ir dentro del texto
    if (usadas.some((f) => /[:;]/.test(f.clave + f.valor))) {
      setError('No uses ":" ni ";" dentro de los nombres o valores.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const texto = aTexto(usadas);
      if (tieneFicha) await ProductoService.editarFicha(producto.sku, texto);
      else await ProductoService.agregarFicha(producto.sku, texto);
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la ficha técnica.'));
      setGuardando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tieneFicha ? 'Editar ficha técnica' : 'Agregar ficha técnica'}</DialogTitle>
        <DialogDescription>
          {producto.sku} · {producto.marca} {producto.modelo}
          {producto.fechaModificacionFicha && ` · última modificación ${fechaHora(producto.fechaModificacionFicha)}`}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground">
          <span>Especificación</span>
          <span>Valor</span>
          <span className="w-9" />
        </div>
        {filas.map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input value={f.clave} placeholder="Cuerpo" onChange={(e) => cambiar(i, 'clave', e.target.value)} />
            <Input value={f.valor} placeholder="Caoba maciza" onChange={(e) => cambiar(i, 'valor', e.target.value)} />
            <Button
              variant="outline"
              size="icon"
              aria-label="Quitar fila"
              disabled={filas.length === 1}
              onClick={() => setFilas(filas.filter((_, j) => j !== i))}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setFilas([...filas, { clave: '', valor: '' }])}>
          <Plus /> Agregar fila
        </Button>

        {/* Así queda guardado en el backend */}
        <p className="break-all rounded-md bg-muted p-2 font-mono text-xs">{aTexto(filas) || 'clave:valor;clave:valor'}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
        <Button onClick={() => void guardar()} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar ficha'}
        </Button>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface FichaTecnicaDialogProps {
  producto: Producto | null; // null = cerrado
  onCerrar: () => void;
  onGuardado: () => void;
}

// La ficha no se elimina: el backend solo permite agregarla (HU-05) y editarla (HU-06)
export const FichaTecnicaDialog = ({ producto, onCerrar, onGuardado }: FichaTecnicaDialogProps) => (
  <Dialog open={producto !== null} onOpenChange={(abierto: boolean) => { if (!abierto) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      {producto && <EditorFicha key={producto.sku} producto={producto} onCerrar={onCerrar} onGuardado={onGuardado} />}
    </DialogContent>
  </Dialog>
);

export default FichaTecnicaDialog;
