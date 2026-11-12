import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Noticia } from '../services/noticia.service'
import { CATEGORIAS_NOTICIA, COLOR_CATEGORIA_NOTICIA } from '../utils/etiquetas'
import { insignia } from '../utils/estilos'
import { imagenRespaldo, recortar, urlImagen } from '../utils/formato'

const INTERVALO = 4500 // milisegundos entre una noticia y la siguiente
const DESLIZAR_MINIMO = 50 // píxeles que hay que arrastrar para cambiar de noticia

// Posición de cada noticia respecto a la activa: 0 = al centro, -1 = a la izquierda, 1 = a la derecha...
// Es "circular": después de la última viene la primera.
const posicion = (indice: number, activa: number, total: number) => {
  let distancia = indice - activa
  if (distancia > total / 2) distancia -= total
  if (distancia < -total / 2) distancia += total
  return distancia
}

// Las noticias se deslizan hacia el lado. La del centro se ve completa y de las vecinas
// se asoma un borde, un poco más chico y más claro, para que se note que hay más.
const estiloTarjeta = (distancia: number): CSSProperties => {
  const lejos = Math.abs(distancia)
  return {
    transform: `translateX(${distancia * 105}%) scale(${lejos === 0 ? 1 : 0.9})`,
    zIndex: 10 - lejos,
    opacity: lejos === 0 ? 1 : lejos === 1 ? 0.45 : 0, // más allá de la vecina no se ve
  }
}

export const CarruselNoticias = ({ noticias }: { noticias: Noticia[] }) => {
  const [activa, setActiva] = useState(0)
  const [pausado, setPausado] = useState(false)
  const inicioArrastre = useRef<number | null>(null)
  const arrastro = useRef(false) // evita que soltar después de arrastrar cuente como clic
  const total = noticias.length

  // Avanza solo. Se pausa con el mouse encima y se reinicia cada vez que cambia la noticia.
  useEffect(() => {
    if (total < 2 || pausado) return
    const temporizador = window.setTimeout(() => setActiva((actual) => (actual + 1) % total), INTERVALO)
    return () => window.clearTimeout(temporizador)
  }, [activa, total, pausado])

  if (total === 0) return null

  const mover = (paso: number) => setActiva((actual) => (actual + paso + total) % total)

  // Deslizar con el dedo o arrastrar con el mouse
  const empezarArrastre = (e: PointerEvent) => {
    inicioArrastre.current = e.clientX
    arrastro.current = false
  }
  const terminarArrastre = (e: PointerEvent) => {
    if (inicioArrastre.current === null) return
    const recorrido = e.clientX - inicioArrastre.current
    inicioArrastre.current = null
    if (Math.abs(recorrido) < DESLIZAR_MINIMO) return
    arrastro.current = true
    mover(recorrido > 0 ? -1 : 1)
  }

  return (
    <div
      className="relative mx-auto max-w-5xl select-none"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div
        className="relative h-64 touch-pan-y overflow-hidden sm:h-[460px]"
        onPointerDown={empezarArrastre}
        onPointerUp={terminarArrastre}
        onPointerLeave={() => (inicioArrastre.current = null)}
      >
        {noticias.map((noticia, indice) => {
          const distancia = posicion(indice, activa, total)
          const esActiva = distancia === 0
          return (
            <div
              key={noticia.idNoticia}
              className="absolute inset-y-0 left-[10%] w-4/5 transition-all duration-700 ease-out sm:left-1/5 sm:w-3/5"
              style={estiloTarjeta(distancia)}
              aria-hidden={!esActiva}
              // Clic en una de los lados: pasa a ser la del centro
              onClick={esActiva ? undefined : () => !arrastro.current && setActiva(indice)}
            >
              <div className={`relative size-full overflow-hidden rounded-xl shadow-lg ${esActiva ? '' : 'cursor-pointer'}`}>
                <img
                  src={urlImagen(noticia.imagenUrl)}
                  onError={imagenRespaldo}
                  className="pointer-events-none size-full object-cover brightness-[0.65]"
                  alt={noticia.titulo}
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-5 pt-12 pb-6 text-white">
                  <span className={`${insignia} mb-2 ${COLOR_CATEGORIA_NOTICIA[noticia.categoria] ?? 'bg-zinc-500 text-white'}`}>
                    {CATEGORIAS_NOTICIA[noticia.categoria] ?? noticia.categoria}
                  </span>
                  <h3 className="mb-1 text-lg leading-tight font-bold text-white sm:text-2xl">{noticia.titulo}</h3>
                  <p className="mb-3 hidden text-sm text-zinc-200 sm:block">{recortar(noticia.contenido, 120)}</p>
                  {esActiva && (
                    <Link
                      to={`/noticias/${noticia.idNoticia}`}
                      className="inline-block rounded bg-white px-3 py-1 text-xs font-bold text-tinta hover:bg-crema"
                    >
                      Leer noticia →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Noticia anterior"
              className="absolute top-1/2 left-1 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Noticia siguiente"
              className="absolute top-1/2 right-1 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores: el de la noticia activa se destaca */}
      {total > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {noticias.map((noticia, indice) => (
            <button
              key={noticia.idNoticia}
              type="button"
              aria-label={`Ir a la noticia ${indice + 1}`}
              aria-current={indice === activa}
              onClick={() => setActiva(indice)}
              className={`h-1.5 rounded-full transition-all ${indice === activa ? 'w-10 bg-tinta' : 'w-6 bg-gris/50 hover:bg-gris'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CarruselNoticias
