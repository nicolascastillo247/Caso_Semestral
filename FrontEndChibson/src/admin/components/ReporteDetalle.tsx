import { useState, type ReactNode } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

import useReporte from '../../hooks/useReporte';
import ReporteService, { type FilaReporte } from '../../services/reporte.service';
import { fechaHora, pesos, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';
import { NOMBRE_ORIGEN, NOMBRE_PERIODO, NOMBRE_TIPO, fechaCorta, rangoReporte } from './textosReporte';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

// ---------- Cómo se muestra cada sección del reporte ----------

interface Columna {
  titulo: string;
  celda: (fila: FilaReporte, indice: number) => ReactNode;
  derecha?: boolean;
}

const monto = (n: number | null) => (n === null ? '—' : pesos(n));
const numero = (n: number | null) => (n === null ? '—' : n);

// "2026-03" → "Marzo 2026"
const nombreMes = (anioMes: string) => {
  const [anio, mes] = anioMes.split('-').map(Number);
  const texto = new Date(anio, mes - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Los indicadores del resumen general mezclan textos, montos y cantidades
const valorIndicador = (f: FilaReporte) => {
  let principal: ReactNode = numero(f.cantidad);
  let detalle = '';
  if (f.valor) {
    principal = f.valor;
    if (f.monto !== null) detalle = `Periodo anterior: ${pesos(f.monto)}`;
    else if (f.cantidad) detalle = `${f.cantidad} unidades`;
  } else if (f.monto !== null) {
    principal = pesos(f.monto);
    if (f.cantidad !== null) detalle = `${f.cantidad} ${f.etiqueta.startsWith('Reembolsos') ? 'unidades' : 'ventas'}`;
  }
  return (
    <>
      <span className="font-medium">{principal}</span>
      {detalle && <span className="block text-xs text-muted-foreground">{detalle}</span>}
    </>
  );
};

const COLUMNAS_PRODUCTO: Columna[] = [
  { titulo: '#', celda: (_, i) => i + 1 },
  { titulo: 'Producto', celda: (f) => f.etiqueta },
  { titulo: 'Categoría', celda: (f) => (f.valor ? textoEnum(f.valor) : '—') },
  { titulo: 'Unidades', celda: (f) => numero(f.cantidad), derecha: true },
  { titulo: 'Ingresos', celda: (f) => monto(f.monto), derecha: true },
];

const SECCIONES: Record<string, { titulo: string; columnas: Columna[] }> = {
  // Ventas por periodo
  TOTALES: {
    titulo: 'Totales',
    columnas: [
      { titulo: 'Concepto', celda: (f) => f.etiqueta },
      { titulo: 'Cantidad', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Monto', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  POR_DIA: {
    titulo: 'Ventas por día',
    columnas: [
      { titulo: 'Fecha', celda: (f) => fechaCorta(f.etiqueta) },
      { titulo: 'Ventas', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Monto neto', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  POR_MES: {
    titulo: 'Ventas por mes',
    columnas: [
      { titulo: 'Mes', celda: (f) => nombreMes(f.etiqueta) },
      { titulo: 'Ventas', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Monto neto', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  // Estado de pedidos
  RESUMEN: {
    titulo: 'Resumen por estado',
    columnas: [
      { titulo: 'Estado', celda: (f) => textoEnum(f.etiqueta) },
      { titulo: 'Pedidos', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Total', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  // Productos más vendidos
  RANKING: { titulo: 'Ranking por unidades vendidas', columnas: COLUMNAS_PRODUCTO },
  // Resumen general (automático)
  INDICADORES: {
    titulo: 'Indicadores',
    columnas: [
      { titulo: 'Indicador', celda: (f) => f.etiqueta },
      { titulo: 'Valor', celda: valorIndicador, derecha: true },
    ],
  },
  TOP_5: { titulo: 'Top 5 productos más vendidos', columnas: COLUMNAS_PRODUCTO },
  POR_CATEGORIA: {
    titulo: 'Ventas por categoría',
    columnas: [
      { titulo: 'Categoría', celda: (f) => textoEnum(f.etiqueta) },
      { titulo: 'Monto neto', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  POR_REGION: {
    titulo: 'Ventas por región',
    columnas: [
      { titulo: 'Región', celda: (f) => f.etiqueta },
      { titulo: 'Ventas', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Monto', celda: (f) => monto(f.monto), derecha: true },
    ],
  },
  STOCK_BAJO: {
    titulo: 'Productos con stock bajo',
    columnas: [
      { titulo: 'Producto', celda: (f) => f.etiqueta },
      { titulo: 'SKU', celda: (f) => f.referencia ?? '—' },
      { titulo: 'Stock', celda: (f) => numero(f.cantidad), derecha: true },
      { titulo: 'Mínimo', celda: (f) => f.valor?.replace('mínimo ', '') ?? '—', derecha: true },
    ],
  },
};

// En "Estado de pedidos", cada estado (PAGADO, ENVIADO...) es una sección con sus pedidos
const seccionDeEstado = (seccion: string) => ({
  titulo: `Pedidos: ${textoEnum(seccion).toLowerCase()}`,
  columnas: [
    { titulo: 'Pedido', celda: (f: FilaReporte) => f.etiqueta },
    // "2026-11-03 · Metropolitana" → "03-11-2026 · Metropolitana"
    { titulo: 'Fecha y región', celda: (f: FilaReporte) => f.valor?.replace(/^\d{4}-\d{2}-\d{2}/, fechaCorta) ?? '—' },
    { titulo: 'Total', celda: (f: FilaReporte) => monto(f.monto), derecha: true },
  ],
});

// Agrupa las filas por sección, respetando el orden en que vienen
const agruparPorSeccion = (filas: FilaReporte[]) => {
  const grupos = new Map<string, FilaReporte[]>();
  for (const fila of filas) {
    grupos.set(fila.seccion, [...(grupos.get(fila.seccion) ?? []), fila]);
  }
  return [...grupos.entries()];
};

// ---------- Componente ----------

interface ReporteDetalleProps {
  // Reporte a mostrar; null = modal cerrado
  id: number | null;
  nombreAdmin: (rut: string) => string;
  onCerrar: () => void;
  onEliminado: () => void;
}

// Modal "Ver reporte". El botón Eliminar va aquí dentro (no en la tabla), con confirmación.
export const ReporteDetalle = ({ id, nombreAdmin, onCerrar, onEliminado }: ReporteDetalleProps) => {
  const { reporte, loading, error } = useReporte(id);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  const cerrar = () => {
    setConfirmando(false);
    setErrorEliminar('');
    onCerrar();
  };

  const eliminar = async () => {
    if (id === null) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await ReporteService.eliminar(id);
      setConfirmando(false);
      onEliminado();
    } catch (err) {
      setErrorEliminar(mensajeError(err, 'No se pudo eliminar el reporte.'));
    } finally {
      setEliminando(false);
    }
  };

  const etiquetaCantidad = reporte?.tipo === 'ESTADO_PEDIDOS' ? 'Pedidos' : 'Ventas';

  return (
    <Dialog open={id !== null} onOpenChange={(abierto: boolean) => { if (!abierto) cerrar(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Reporte #{id}{reporte && ` — ${NOMBRE_TIPO[reporte.tipo]}`}
          </DialogTitle>
          <DialogDescription>
            {reporte ? `${NOMBRE_PERIODO[reporte.periodo]}: ${rangoReporte(reporte)}` : 'Cargando...'}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Cargando reporte...</p>}
        {error && <p className="text-sm text-red-600">No se pudo cargar el reporte.</p>}

        {reporte && (
          <div className="space-y-5">
            {/* Datos del reporte */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <strong>Origen:</strong>{' '}
                <Badge variant={reporte.origen === 'MANUAL' ? 'secondary' : 'outline'}>{NOMBRE_ORIGEN[reporte.origen]}</Badge>
              </p>
              <p>
                <strong>Generado por:</strong>{' '}
                {reporte.rutAdministrador ? nombreAdmin(reporte.rutAdministrador) : 'Sistema'}
              </p>
              <p><strong>Fecha de creación:</strong> {fechaHora(reporte.fechaCreacion)}</p>
              {reporte.categoria && <p><strong>Categoría:</strong> {textoEnum(reporte.categoria)}</p>}
            </div>

            {/* Totales principales */}
            <div className="grid gap-3 sm:grid-cols-3">
              {reporte.totalVentas !== null && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    {reporte.tipo === 'PRODUCTOS_MAS_VENDIDOS' ? 'Ingresos' : 'Ventas netas'}
                  </p>
                  <p className="text-xl font-bold">{pesos(reporte.totalVentas)}</p>
                </div>
              )}
              {reporte.numeroPedidos !== null && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{etiquetaCantidad}</p>
                  <p className="text-xl font-bold">{reporte.numeroPedidos}</p>
                </div>
              )}
              {reporte.ticketPromedio !== null && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Ticket promedio</p>
                  <p className="text-xl font-bold">{pesos(reporte.ticketPromedio)}</p>
                </div>
              )}
            </div>

            {/* Aviso cuando el periodo no tiene datos */}
            {reporte.mensaje && (
              <p className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="size-4 shrink-0" /> {reporte.mensaje}
              </p>
            )}

            {/* Una tabla por sección */}
            {agruparPorSeccion(reporte.filas).map(([seccion, filas]) => {
              const { titulo, columnas } = SECCIONES[seccion] ?? seccionDeEstado(seccion);
              return (
                <div key={seccion} className="space-y-2">
                  <h3 className="font-semibold">{titulo}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columnas.map((c) => (
                          <TableHead key={c.titulo} className={c.derecha ? 'text-right' : ''}>{c.titulo}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filas.map((fila, i) => (
                        <TableRow key={fila.idFila}>
                          {columnas.map((c) => (
                            <TableCell key={c.titulo} className={c.derecha ? 'text-right' : ''}>{c.celda(fila, i)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Eliminar con confirmación en dos pasos */}
          {confirmando ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar este reporte? No se puede deshacer.</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={eliminando}>
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={eliminando}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmando(true)} disabled={!reporte}>
              <Trash2 /> Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={cerrar}>Cerrar</Button>
        </DialogFooter>
        {errorEliminar && <p className="text-sm text-red-600">{errorEliminar}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default ReporteDetalle;
