import type { SyntheticEvent } from 'react'

const formateadorPrecio = new Intl.NumberFormat('es-CL')

export const formatearPrecio = (valor?: number | null): string =>
  `$${formateadorPrecio.format(valor ?? 0)} CLP`

const aFecha = (valor?: string | null): Date | null => {
  if (!valor) return null
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
  const fecha = new Date(soloFecha ? `${valor}T00:00:00` : valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

export const formatearFecha = (valor?: string | null): string => {
  const fecha = aFecha(valor)
  return fecha
    ? fecha.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'
}

export const formatearFechaLarga = (valor?: string | null): string => {
  const fecha = aFecha(valor)
  return fecha ? fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
}

export const formatearFechaHora = (valor?: string | null): string => {
  const fecha = aFecha(valor)
  return fecha
    ? fecha.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
}

export const numeroConCeros = (numero?: number | null, largo = 4): string =>
  String(numero ?? 0).padStart(largo, '0')

export const estrellas = (calificacion: number): string => {
  const llenas = Math.round(Math.max(0, Math.min(5, calificacion)))
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas)
}

export const urlImagen = (url?: string | null): string => {
  if (!url) return '/img/logo.png'
  if (/^(https?:)?\/\//.test(url) || url.startsWith('/') || url.startsWith('data:')) return url
  return `/${url}`
}

export const imagenRespaldo = (evento: SyntheticEvent<HTMLImageElement>) => {
  const img = evento.currentTarget
  if (!img.src.endsWith('/img/logo.png')) {
    img.src = '/img/logo.png'
  }
}

export const recortar = (texto: string | undefined | null, largo: number): string => {
  if (!texto) return ''
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto
}
