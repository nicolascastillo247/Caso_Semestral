import type { OrigenReporte, Periodo, ReporteListado, TipoReporte } from '../../services/reporte.service';

// Textos para mostrar los enums del microservicio de informes

export const NOMBRE_TIPO: Record<TipoReporte, string> = {
  VENTAS_POR_PERIODO: 'Ventas por periodo',
  ESTADO_PEDIDOS: 'Estado de pedidos',
  PRODUCTOS_MAS_VENDIDOS: 'Productos más vendidos',
  RESUMEN_GENERAL: 'Resumen general',
};

export const NOMBRE_PERIODO: Record<Periodo, string> = {
  DIARIO: 'Diario',
  SEMANAL: 'Semanal',
  MENSUAL: 'Mensual',
  ANUAL: 'Anual',
  PERSONALIZADO: 'Personalizado',
};

export const NOMBRE_ORIGEN: Record<OrigenReporte, string> = {
  MANUAL: 'Manual',
  AUTOMATICO: 'Automático',
};

// "2026-11-01" → "01-11-2026".
// No se usa new Date() porque "2026-11-01" lo toma como hora UTC y en Chile mostraría el día anterior.
export const fechaCorta = (fecha: string) => fecha.slice(0, 10).split('-').reverse().join('-');

// Rango del reporte: "08-11-2026" si es un solo día, o "01-11-2026 al 30-11-2026"
export const rangoReporte = (r: Pick<ReporteListado, 'fechaDesde' | 'fechaHasta'>) =>
  r.fechaDesde === r.fechaHasta
    ? fechaCorta(r.fechaDesde)
    : `${fechaCorta(r.fechaDesde)} al ${fechaCorta(r.fechaHasta)}`;
