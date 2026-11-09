import { apiClient } from './api';

export type TipoReporte = 'VENTAS_POR_PERIODO' | 'ESTADO_PEDIDOS' | 'PRODUCTOS_MAS_VENDIDOS' | 'RESUMEN_GENERAL';
export type Periodo = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO';
export type OrigenReporte = 'MANUAL' | 'AUTOMATICO';

// Fila del listado (GET /reportes), sin el detalle
export interface ReporteListado {
  idReporte: number;
  tipo: TipoReporte;
  periodo: Periodo;
  fechaDesde: string;
  fechaHasta: string;
  origen: OrigenReporte;
  rutAdministrador: string | null;
  fechaCreacion: string;
}

// Una fila del contenido. "seccion" agrupa las filas: TOTALES, POR_DIA, RANKING, TOP_5...
export interface FilaReporte {
  idFila: number;
  orden: number;
  seccion: string;
  etiqueta: string;
  valor: string | null;
  cantidad: number | null;
  monto: number | null;
  referencia: string | null;
}

// Reporte completo (GET /reportes/{id})
export interface Reporte extends ReporteListado {
  categoria: string | null;
  totalVentas: number | null;
  numeroPedidos: number | null;
  ticketPromedio: number | null;
  mensaje: string | null;
  filas: FilaReporte[];
}

// Lo que se manda al generar un reporte manual (POST /reportes)
export interface GenerarReporte {
  tipo: TipoReporte;
  periodo: Periodo;
  desde?: string;
  hasta?: string;
  categoria?: string;
}

const resource = '/reportes';

export const ReporteService = {
  async listar(): Promise<ReporteListado[]> {
    const { data } = await apiClient.get<ReporteListado[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Reporte> {
    const { data } = await apiClient.get<Reporte>(`${resource}/${id}`);
    return data;
  },

  async crear(datos: GenerarReporte): Promise<Reporte> {
    const { data } = await apiClient.post<Reporte>(resource, datos);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  }
};

export default ReporteService;
