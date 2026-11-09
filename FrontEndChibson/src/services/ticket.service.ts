import { apiClient } from './api';

export type EstadoTicket = 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
export type CategoriaTicket = 'DESPACHO' | 'GARANTIA' | 'PAGO' | 'PEDIDO' | 'OTRO';

// Una respuesta dentro de la conversación
export interface MensajeTicket {
  idMensaje: number;
  rutAutor: string;
  esAdministrador: boolean;
  contenido: string;
  fecha: string;
}

export interface Ticket {
  numeroTicket: number;
  rutCliente: string;
  nombreCliente: string | null; // null si ms-usuarios no respondió
  asunto: string;
  categoria: CategoriaTicket;
  descripcion: string;
  adjuntoUrl: string | null;
  estado: EstadoTicket;
  calificacion: number | null;
  comentarioCalificacion: string | null;
  fechaCreacion: string;
  fechaResolucion: string | null;
  mensajes: MensajeTicket[];
}

const resource = '/tickets';

// Endpoints de administración (permiso GESTIONAR_SOPORTE)
export const TicketService = {
  async listar(): Promise<Ticket[]> {
    const { data } = await apiClient.get<Ticket[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(numero: number): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`${resource}/${numero}`);
    return data;
  },

  // Agrega una respuesta. Si viene estado, también lo cambia.
  async responder(numero: number, contenido: string, estado?: EstadoTicket): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>(`${resource}/${numero}/respuestas`, { contenido, estado });
    return data;
  },

  // Cambia el estado sin escribir respuesta
  async actualizarEstado(numero: number, estado: EstadoTicket): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`${resource}/${numero}/estado`, { estado });
    return data;
  },

  async eliminar(numero: number): Promise<void> {
    await apiClient.delete(`${resource}/${numero}`);
  }
};

export default TicketService;
