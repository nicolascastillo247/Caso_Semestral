import { useState } from 'react'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import NoticiaCard from '../../components/NoticiaCard'
import useNoticias from '../../hooks/useNoticias'
import { campoBase } from '../../utils/estilos'

// Botones de la paginación: la página actual se destaca en dorado y queda deshabilitada
const ESTILO_PAGINA = {
  normal: 'bg-white hover:border-dorado hover:bg-crema',
  actual: 'border-dorado bg-dorado font-semibold',
  deshabilitado: 'bg-fondo text-gris opacity-65',
}
const clasePagina = (estado: keyof typeof ESTILO_PAGINA) =>
  `-ml-px h-9 min-w-9 border border-gris px-3 text-sm first:ml-0 first:rounded-l-md last:rounded-r-md ${ESTILO_PAGINA[estado]}`

export const NoticiasPage = () => {
  const { noticias, cargando, error, recargar } = useNoticias()
  const [porPagina, setPorPagina] = useState(6)
  const [pagina, setPagina] = useState(1)

  const totalPaginas = Math.max(1, Math.ceil(noticias.length / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * porPagina
  const visibles = noticias.slice(inicio, inicio + porPagina)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-bold">Noticias y Novedades</h2>
        {noticias.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="porPagina" className="text-sm whitespace-nowrap">
                Post por página
              </label>
              <select
                id="porPagina"
                className={`${campoBase} h-8 w-auto`}
                value={porPagina}
                onChange={(e) => {
                  setPorPagina(Number(e.target.value))
                  setPagina(1)
                }}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
              </select>
            </div>
            <span className="text-sm text-gris">
              {inicio + 1}–{inicio + visibles.length} de {noticias.length}
            </span>
          </div>
        )}
      </div>

      {cargando && <Cargando texto="Cargando noticias..." />}
      <MensajeError mensaje={error} alReintentar={recargar} />
      {!cargando && !error && noticias.length === 0 && <p className="text-gris">No hay noticias publicadas por ahora.</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibles.map((noticia) => (
          <NoticiaCard key={noticia.idNoticia} noticia={noticia} />
        ))}
      </div>

      {totalPaginas > 1 && (
        <nav aria-label="Paginación de noticias" className="mt-10 flex justify-center">
          <button
            type="button"
            className={clasePagina(paginaActual === 1 ? 'deshabilitado' : 'normal')}
            disabled={paginaActual === 1}
            onClick={() => setPagina(paginaActual - 1)}
          >
            Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <button
              key={numero}
              type="button"
              className={clasePagina(numero === paginaActual ? 'actual' : 'normal')}
              disabled={numero === paginaActual}
              aria-current={numero === paginaActual ? 'page' : undefined}
              onClick={() => setPagina(numero)}
            >
              {numero}
            </button>
          ))}
          <button
            type="button"
            className={clasePagina(paginaActual === totalPaginas ? 'deshabilitado' : 'normal')}
            disabled={paginaActual === totalPaginas}
            onClick={() => setPagina(paginaActual + 1)}
          >
            Siguiente
          </button>
        </nav>
      )}
    </>
  )
}

export default NoticiasPage
