import NoticiaService from '../services/noticia.service'
import useApi from './useApi'

export const useNoticias = () => {
  const { datos, cargando, error, recargar } = useApi(() => NoticiaService.listarPublicadas())
  const noticias = [...(datos ?? [])].sort((a, b) =>
    (b.fechaPublicacion ?? '').localeCompare(a.fechaPublicacion ?? ''),
  )
  return { noticias, cargando, error, recargar }
}

export default useNoticias
