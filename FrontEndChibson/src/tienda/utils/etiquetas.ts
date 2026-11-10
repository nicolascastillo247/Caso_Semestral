export const CATEGORIAS_PRODUCTO: Record<string, string> = {
  GUITARRA: 'Guitarras',
  BAJO: 'Bajos',
  PERCUSION: 'Baterías y Percusión',
  TECLAS: 'Teclados y Pianos',
  VIENTO: 'Instrumentos de viento',
  CUERDAS: 'Cuerdas y Accesorios',
}

export const CATEGORIAS_NOTICIA: Record<string, string> = {
  PROMOCION: 'Promoción',
  EVENTO: 'Evento',
  ANUNCIO: 'Anuncio',
}

// Colores de Tailwind para las insignias (se combinan con `insignia` de utils/estilos.ts)
export const COLOR_CATEGORIA_NOTICIA: Record<string, string> = {
  PROMOCION: 'bg-red-600 text-white',
  EVENTO: 'bg-sky-200 text-sky-900',
  ANUNCIO: 'bg-amber-200 text-amber-900',
}

export const ESTADOS_PEDIDO: Record<string, { texto: string; color: string }> = {
  PENDIENTE: { texto: 'Pago pendiente', color: 'bg-zinc-500 text-white' },
  PAGADO: { texto: 'Confirmado', color: 'bg-blue-600 text-white' },
  EN_PROCESO: { texto: 'En preparación', color: 'bg-sky-200 text-sky-900' },
  ENVIADO: { texto: 'En camino', color: 'bg-amber-200 text-amber-900' },
  ENTREGADO: { texto: 'Entregado', color: 'bg-green-600 text-white' },
  CANCELADO: { texto: 'Cancelado', color: 'bg-red-600 text-white' },
}

export const METODOS_PAGO: Record<string, string> = {
  DEBITO: 'Tarjeta de débito',
  CREDITO: 'Tarjeta de crédito',
  TRANSFERENCIA: 'Transferencia bancaria',
}

export const MOTIVOS_DEVOLUCION: Record<string, string> = {
  PRODUCTO_DEFECTUOSO: 'Producto defectuoso',
  PRODUCTO_DANADO: 'Producto dañado',
  PRODUCTO_INCORRECTO: 'Producto incorrecto',
  OTRO: 'Otro',
}

export const ESTADOS_DEVOLUCION: Record<string, { texto: string; color: string }> = {
  PENDIENTE: { texto: 'En revisión', color: 'bg-amber-200 text-amber-900' },
  APROBADA: { texto: 'Aprobada', color: 'bg-blue-600 text-white' },
  RECHAZADA: { texto: 'Rechazada', color: 'bg-red-600 text-white' },
  REEMBOLSADA: { texto: 'Reembolsada', color: 'bg-green-600 text-white' },
}

export const CATEGORIAS_TICKET: Record<string, string> = {
  PEDIDO: 'Pedido',
  PAGO: 'Pago',
  DESPACHO: 'Despacho',
  GARANTIA: 'Garantía',
  OTRO: 'Otro',
}

export const ESTADOS_TICKET: Record<string, { texto: string; color: string }> = {
  ABIERTO: { texto: 'Abierto', color: 'bg-zinc-500 text-white' },
  EN_PROCESO: { texto: 'En proceso', color: 'bg-sky-200 text-sky-900' },
  RESUELTO: { texto: 'Resuelto', color: 'bg-green-600 text-white' },
  CERRADO: { texto: 'Cerrado', color: 'bg-zinc-900 text-white' },
}
