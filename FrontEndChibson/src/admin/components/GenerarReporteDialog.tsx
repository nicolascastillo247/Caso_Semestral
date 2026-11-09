import { useState, type FormEvent } from 'react';

import ReporteService, { type Periodo, type Reporte, type TipoReporte } from '../../services/reporte.service';
import { estiloCampo, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';
import { NOMBRE_PERIODO, NOMBRE_TIPO, rangoReporte } from './textosReporte';

import { Button } from '../../components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

// El resumen general no aparece: solo lo genera el sistema (semanal y mensual)
const TIPOS_MANUALES: TipoReporte[] = ['VENTAS_POR_PERIODO', 'ESTADO_PEDIDOS', 'PRODUCTOS_MAS_VENDIDOS'];
const PERIODOS: Periodo[] = ['DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL', 'PERSONALIZADO'];
const CATEGORIAS = ['GUITARRA', 'BAJO', 'PERCUSION', 'TECLAS', 'VIENTO', 'CUERDAS'];

const ETIQUETA_FECHA: Record<Periodo, string> = {
  DIARIO: 'Día',
  SEMANAL: 'Cualquier día de la semana',
  MENSUAL: 'Cualquier día del mes',
  ANUAL: 'Cualquier día del año',
  PERSONALIZADO: 'Desde',
};

// ---------- Rango que va a calcular el backend (para mostrarlo antes de generar) ----------

const aISO = (d: Date) => d.toLocaleDateString('en-CA');
const deISO = (texto: string) => {
  const [a, m, d] = texto.split('-').map(Number);
  return new Date(a, m - 1, d);
};

// Misma lógica que resolverRango() en ms-informes
const rangoPrevisto = (periodo: Periodo, desde: string, hasta: string) => {
  if (periodo === 'PERSONALIZADO') {
    return desde && hasta && desde <= hasta ? { fechaDesde: desde, fechaHasta: hasta } : null;
  }
  const ref = desde ? deISO(desde) : new Date();
  const a = ref.getFullYear();
  const m = ref.getMonth();
  switch (periodo) {
    case 'DIARIO':
      return { fechaDesde: aISO(ref), fechaHasta: aISO(ref) };
    case 'SEMANAL': {
      const lunes = new Date(a, m, ref.getDate() - ((ref.getDay() + 6) % 7));
      const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
      return { fechaDesde: aISO(lunes), fechaHasta: aISO(domingo) };
    }
    case 'MENSUAL':
      return { fechaDesde: aISO(new Date(a, m, 1)), fechaHasta: aISO(new Date(a, m + 1, 0)) };
    case 'ANUAL':
      return { fechaDesde: `${a}-01-01`, fechaHasta: `${a}-12-31` };
  }
};

// ---------- Componente ----------

interface GenerarReporteDialogProps {
  abierto: boolean;
  onCerrar: () => void;
  onGenerado: (reporte: Reporte) => void;
}

export const GenerarReporteDialog = ({ abierto, onCerrar, onGenerado }: GenerarReporteDialogProps) => {
  const [tipo, setTipo] = useState<TipoReporte>('VENTAS_POR_PERIODO');
  const [periodo, setPeriodo] = useState<Periodo>('MENSUAL');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const personalizado = periodo === 'PERSONALIZADO';
  const rango = rangoPrevisto(periodo, desde, hasta);

  const cerrar = () => {
    setError('');
    onCerrar();
  };

  const generar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (personalizado && (!desde || !hasta)) {
      setError('Para un periodo personalizado debes indicar desde y hasta.');
      return;
    }
    if (personalizado && desde > hasta) {
      setError('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const reporte = await ReporteService.crear({
        tipo,
        periodo,
        desde: desde || undefined,
        hasta: personalizado ? hasta : undefined,
        categoria: tipo === 'PRODUCTOS_MAS_VENDIDOS' && categoria ? categoria : undefined,
      });
      // Deja el formulario listo para el siguiente
      setDesde('');
      setHasta('');
      setCategoria('');
      onGenerado(reporte);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo generar el reporte. Revisa que ms-informes y ms-ventas estén encendidos.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(abrir: boolean) => { if (!abrir) cerrar(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generar reporte</DialogTitle>
          <DialogDescription>El reporte queda guardado con los datos de este momento.</DialogDescription>
        </DialogHeader>

        <form id="form-generar-reporte" className="space-y-3" onSubmit={(e) => void generar(e)}>
          <label className="flex flex-col gap-1 text-sm">
            Tipo de reporte
            <select className={estiloCampo} value={tipo} onChange={(e) => setTipo(e.target.value as TipoReporte)}>
              {TIPOS_MANUALES.map((t) => (
                <option key={t} value={t}>{NOMBRE_TIPO[t]}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Periodo
            <select className={estiloCampo} value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)}>
              {PERIODOS.map((p) => (
                <option key={p} value={p}>{NOMBRE_PERIODO[p]}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className={`flex flex-col gap-1 text-sm ${personalizado ? '' : 'col-span-2'}`}>
              {ETIQUETA_FECHA[periodo]}
              <input
                type="date"
                className={estiloCampo}
                value={desde}
                max={personalizado && hasta ? hasta : undefined}
                onChange={(e) => setDesde(e.target.value)}
              />
            </label>
            {personalizado && (
              <label className="flex flex-col gap-1 text-sm">
                Hasta
                <input
                  type="date"
                  className={estiloCampo}
                  value={hasta}
                  min={desde || undefined}
                  onChange={(e) => setHasta(e.target.value)}
                />
              </label>
            )}
          </div>
          {!personalizado && !desde && <p className="text-xs text-muted-foreground">Si lo dejas vacío se usa la fecha de hoy.</p>}

          {tipo === 'PRODUCTOS_MAS_VENDIDOS' && (
            <label className="flex flex-col gap-1 text-sm">
              Categoría (opcional)
              <select className={estiloCampo} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{textoEnum(c)}</option>
                ))}
              </select>
            </label>
          )}

          {rango && (
            <p className="rounded-md bg-muted p-2 text-sm">
              Se generará con los datos del <strong>{rangoReporte(rango)}</strong>
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={cerrar} disabled={enviando}>Cancelar</Button>
          <Button type="submit" form="form-generar-reporte" disabled={enviando}>
            {enviando ? 'Generando...' : 'Generar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerarReporteDialog;
