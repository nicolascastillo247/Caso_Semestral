// Funciones de formato que comparten todas las páginas

// 1450000 → "$1.450.000"
const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
export const pesos = (monto: number) => formatoPesos.format(monto);

// "2026-11-07T21:19:05" → "07-11-2026, 21:19:05"
export const fechaHora = (fecha: string) => new Date(fecha).toLocaleString('es-CL');

// "2026-11-07T21:19:05" → "07-11-2026"
export const soloFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-CL');

// "EN_PROCESO" → "En proceso"
export const textoEnum = (valor: string) => {
  const texto = valor.replaceAll('_', ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// "sábado, 7 de noviembre de 2026" → "Sábado, 7 de noviembre de 2026"
export const fechaDeHoy = () => {
  const hoy = new Date().toLocaleDateString('es-CL', { dateStyle: 'full' });
  return hoy.charAt(0).toUpperCase() + hoy.slice(1);
};

// Estilo de los <select> y <input type="date"> para que combinen con el Input de shadcn
export const estiloCampo =
  'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
