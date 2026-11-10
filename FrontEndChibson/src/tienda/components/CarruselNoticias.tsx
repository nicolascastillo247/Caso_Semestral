import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Noticia } from '../services/noticia.service'
import { CATEGORIAS_NOTICIA, COLOR_CATEGORIA_NOTICIA } from '../utils/etiquetas'
import { insignia } from '../utils/estilos'
import { imagenRespaldo, recortar, urlImagen } from '../utils/formato'

// Carrusel hecho con estado de React (antes usaba las clases "carousel" de Bootstrap)
export const CarruselNoticias = ({ noticias }: { noticias: Noticia[] }) => {
  const [activa, setActiva] = useState(0)
  const total = noticias.length

  useEffect(() => {
    if (total < 2) return
    const intervalo = window.setInterval(() => setActiva((actual) => (actual + 1) % total), 4500)
    return () => window.clearInterval(intervalo)
  }, [total])

  if (total === 0) return null

  const mover = (paso: number) => setActiva((actual) => (actual + paso + total) % total)

  return (
    <div className="relative mx-auto h-36 max-w-3xl overflow-hidden rounded-xl shadow-md sm:h-[600px]">
      {/* Las noticias se apilan y solo la activa queda visible (efecto de desvanecido) */}
      {noticias.map((noticia, indice) => (
        <div
          key={noticia.idNoticia}
          className={`absolute inset-0 transition-opacity duration-700 ${indice === activa ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden={indice !== activa}
        >
          <img
            src={urlImagen(noticia.imagenUrl)}
            onError={imagenRespaldo}
            className="size-full object-cover brightness-[0.65]"
            alt={noticia.titulo}
          />
          <div className="absolute inset-x-0 bottom-1 px-12 pb-8 text-white">
            <span className={`${insignia} mb-1 ${COLOR_CATEGORIA_NOTICIA[noticia.categoria] ?? 'bg-zinc-500 text-white'}`}>
              {CATEGORIAS_NOTICIA[noticia.categoria] ?? noticia.categoria}
            </span>
            <h3 className="mb-1 text-base leading-tight font-bold text-white">{noticia.titulo}</h3>
            <p className="mb-2 hidden text-xs text-zinc-200 sm:block">{recortar(noticia.contenido, 110)}</p>
            <Link
              to={`/noticias/${noticia.idNoticia}`}
              className="inline-block rounded bg-white px-2 py-1 text-xs font-bold text-tinta hover:bg-crema"
            >
              Leer noticia →
            </Link>
          </div>
        </div>
      ))}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Anterior"
            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Siguiente"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white hover:bg-black/50"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Indicadores */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
            {noticias.map((noticia, indice) => (
              <button
                key={noticia.idNoticia}
                type="button"
                aria-label={`Noticia ${indice + 1}`}
                aria-current={indice === activa}
                onClick={() => setActiva(indice)}
                className={`h-1 w-8 rounded-full transition ${indice === activa ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CarruselNoticias
