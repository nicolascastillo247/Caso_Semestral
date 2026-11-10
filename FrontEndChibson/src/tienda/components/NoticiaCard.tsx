import { Link } from 'react-router'
import type { Noticia } from '../services/noticia.service'
import { CATEGORIAS_NOTICIA, COLOR_CATEGORIA_NOTICIA } from '../utils/etiquetas'
import { insignia, tarjetaHover } from '../utils/estilos'
import { formatearFechaLarga, imagenRespaldo, recortar, urlImagen } from '../utils/formato'

export const NoticiaCard = ({ noticia }: { noticia: Noticia }) => {
  const detalle = `/noticias/${noticia.idNoticia}`
  return (
    <article className={`h-full rounded-lg bg-white p-4 shadow-sm ${tarjetaHover}`}>
      <Link to={detalle} className="block overflow-hidden rounded-lg">
        <img
          src={urlImagen(noticia.imagenUrl)}
          onError={imagenRespaldo}
          alt={noticia.titulo}
          className="mb-4 h-52 w-full rounded-lg object-cover transition-transform hover:scale-[1.02]"
        />
      </Link>
      <div className="mb-2 flex items-center gap-2">
        <span className={`${insignia} ${COLOR_CATEGORIA_NOTICIA[noticia.categoria] ?? 'bg-zinc-500 text-white'}`}>
          {CATEGORIAS_NOTICIA[noticia.categoria] ?? noticia.categoria}
        </span>
        <span className="text-sm text-gris">{formatearFechaLarga(noticia.fechaPublicacion)}</span>
      </div>
      <h3 className="mb-2 text-lg leading-snug font-bold">
        <Link to={detalle} className="hover:text-ocre hover:underline">
          {noticia.titulo}
        </Link>
      </h3>
      <p className="mb-0 line-clamp-3 text-sm text-zinc-600">{recortar(noticia.contenido, 220)}</p>
    </article>
  )
}

export default NoticiaCard
