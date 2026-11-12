// Clases de Tailwind que se repiten en toda la tienda.
// Los colores (crema, dorado, tinta, gris, fondo) se definen en tienda.css.

// Botones (se usan en <button> y también en <Link> que deben verse como botón).
// El tamaño va aparte para que no choque con las clases del color: boton('contorno', 'chico')
const baseBoton =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors ' +
  'outline-none focus-visible:ring-3 focus-visible:ring-dorado/40 disabled:pointer-events-none disabled:opacity-50 ' +
  '[&_svg]:size-4 [&_svg]:shrink-0'

const VARIANTES = {
  dorado: 'border border-tinta/10 bg-dorado font-titulo font-semibold text-tinta hover:bg-dorado-oscuro',
  contorno: 'border border-tinta bg-transparent text-tinta hover:bg-tinta hover:text-white',
  secundario: 'border border-gris/60 bg-white text-tinta hover:bg-fondo',
  peligro: 'border border-red-600 bg-transparent text-red-700 hover:bg-red-600 hover:text-white',
}

const TAMANOS = {
  normal: 'h-10 px-4 text-sm',
  chico: 'h-8 px-3 text-xs',
  grande: 'h-14 px-6 text-lg',
}

export const boton = (variante: keyof typeof VARIANTES = 'dorado', tamano: keyof typeof TAMANOS = 'normal') =>
  `${baseBoton} ${TAMANOS[tamano]} ${VARIANTES[variante]}`

// Atajos para el tamaño normal
export const botonDorado = boton('dorado')
export const botonContorno = boton('contorno')
export const botonSecundario = boton('secundario')
export const botonPeligro = boton('peligro')

export const anchoCompleto = ' w-full'

// Formularios
// La forma del campo va separada de sus colores: así el campo con error no tiene clases que choquen
const formaCampo =
  'rounded-md border px-3 text-sm text-tinta shadow-xs outline-none placeholder:text-gris ' +
  'focus-visible:ring-3 disabled:bg-fondo disabled:opacity-70'
const coloresCampo = 'border-gris/50 bg-white focus-visible:border-dorado focus-visible:ring-dorado/30'
const coloresError = 'border-red-500 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500/25'

// campoBase no trae alto ni ancho: se usa cuando hay que darle otro tamaño (por ejemplo `${campoBase} h-8 w-auto`)
export const campoBase = `${formaCampo} ${coloresCampo}`

export const campo = `${campoBase} h-10 w-full`

// Mismo campo, marcado en rojo porque su valor no es válido
export const campoConError = `${formaCampo} ${coloresError} h-10 w-full`

export const areaTexto = `${campoBase} min-h-28 w-full py-2`

export const etiqueta = 'mb-1 block text-sm font-semibold'
export const ayuda = 'mt-1 text-xs text-gris'
export const casilla = 'size-4 accent-dorado'

// Contenedores
export const tarjeta = 'rounded-lg bg-white p-6 shadow-sm'
export const tarjetaCrema = 'rounded-lg bg-crema p-6 shadow-sm'
export const tarjetaHover = 'transition hover:-translate-y-0.5 hover:shadow-lg'
export const divisor = 'my-10 border-0 border-t border-gris/35'

// Textos
export const tituloPagina = 'mb-6 text-3xl font-bold'
export const tituloSeccion = 'mb-4 text-2xl font-bold'
export const textoSuave = 'text-gris'
export const enlace = 'font-semibold text-tinta hover:text-ocre hover:underline'
export const precio = 'text-xl font-bold text-ocre'

// Avisos (como los "alert" de Bootstrap: dejan un espacio abajo)
export const aviso = {
  error: 'mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800',
  advertencia: 'mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900',
  exito: 'mb-4 rounded-md border border-dorado bg-crema p-4 text-sm text-tinta',
  info: 'mb-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900',
}

// Insignias (badges): base + color de utils/etiquetas.ts
export const insignia = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap'

// Tablas
export const encabezadoTabla = 'border-b-2 border-dorado bg-crema'
