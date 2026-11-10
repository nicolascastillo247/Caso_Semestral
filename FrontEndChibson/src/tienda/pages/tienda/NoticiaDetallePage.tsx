import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import Migas from '../../components/Migas'
import useApi from '../../hooks/useApi'
import useNoticias from '../../hooks/useNoticias'
import NoticiaService from '../../services/noticia.service'
import { CATEGORIAS_NOTICIA, COLOR_CATEGORIA_NOTICIA } from '../../utils/etiquetas'
import { enlace, insignia } from '../../utils/estilos'
import { formatearFechaLarga, imagenRespaldo, urlImagen } from '../../utils/formato'

export const NoticiaDetallePage = () => {
  const { id = '' } = useParams()
  const idNoticia = Number(id)
  const { datos: noticia, cargando, error, recargar } = useApi(
    () => NoticiaService.obtenerPublicada(idNoticia),
    [idNoticia],
  )
  const { noticias } = useNoticias()

  if (cargando) return <Cargando texto="Cargando artículo..." />
  if (error || !noticia) {
    return (
      <div className="space-y-4">
        <MensajeError mensaje={error ?? 'La noticia no existe.'} alReintentar={recargar} />
        <Link to="/noticias" className={enlace}>
          ← Volver a noticias
        </Link>
      </div>
    )
  }

  const posicion = noticias.findIndex((n) => n.idNoticia === noticia.idNoticia)
  const siguiente = posicion >= 0 && noticias.length > 1 ? noticias[(posicion + 1) % noticias.length] : null

  return (
    <>
      <Migas pasos={[{ texto: 'Noticias', to: '/noticias' }, { texto: 'Artículo' }]} />

      <article className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm md:p-12">
        <header className="mb-6">
          <span className={`${insignia} mb-2 ${COLOR_CATEGORIA_NOTICIA[noticia.categoria] ?? 'bg-zinc-500 text-white'}`}>
            {CATEGORIAS_NOTICIA[noticia.categoria] ?? noticia.categoria}
          </span>
          <h2 className="mb-2 text-3xl font-bold">{noticia.titulo}</h2>
          <p className="mb-0 text-sm text-gris">
            Publicado por <strong>Taller Chibson</strong> <span className="mx-1">|</span>
            <span>{formatearFechaLarga(noticia.fechaPublicacion)}</span>
          </p>
        </header>

        {noticia.imagenUrl && (
          <figure className="mb-6">
            <img
              src={urlImagen(noticia.imagenUrl)}
              onError={imagenRespaldo}
              alt={noticia.titulo}
              className="max-h-[420px] w-full rounded object-cover"
            />
          </figure>
        )}

        <section>
          {noticia.contenido.split(/\n+/).map((parrafo, indice) => (
            <p key={indice}>{parrafo}</p>
          ))}
        </section>

        <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t pt-4">
          <Link to="/noticias" className={enlace}>
            ← Volver a noticias
          </Link>
          {siguiente && (
            <Link to={`/noticias/${siguiente.idNoticia}`} className={enlace}>
              Ver siguiente noticia →
            </Link>
          )}
        </footer>
      </article>
    </>
  )
}

export default NoticiaDetallePage
