import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import { useProducto } from '../../hooks/useProductos'
import { mensajeDeError } from '../../api/apiClient'
import ResenaService from '../../services/resena.service'
import { imagenRespaldo, urlImagen } from '../../utils/formato'
import { areaTexto, botonDorado, campo } from '../../utils/estilos'

const OPCIONES = [
  [5, 'Excelente'],
  [4, 'Muy bueno'],
  [3, 'Bueno'],
  [2, 'Regular'],
  [1, 'Malo'],
] as const

export const DejarResenaPage = () => {
  const { sku = '' } = useParams()
  const { producto, cargando, error: errorProducto } = useProducto(sku)
  const [calificacion, setCalificacion] = useState('')
  const [titulo, setTitulo] = useState('')
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviada, setEnviada] = useState(false)
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <Cargando texto="Cargando producto..." />
  if (errorProducto || !producto) return <MensajeError mensaje={errorProducto ?? 'El producto no existe.'} />

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await ResenaService.crear({ sku: producto.sku, calificacion: Number(calificacion), titulo, comentario })
      setEnviada(true)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo publicar la reseña.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dejar reseña</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-lg bg-white shadow-sm p-6 text-center">
            <img
              src={urlImagen(producto.imagenUrl)}
              onError={imagenRespaldo}
              alt={producto.modelo}
              className="mx-auto mb-4 max-h-[200px] max-w-full object-contain"
            />
            <h2 className="text-lg font-bold mb-0">{producto.modelo}</h2>
            <p className="text-sm text-gris mb-0">{producto.marca}</p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="rounded-lg bg-white shadow-sm p-6">
            {enviada ? (
              <div className="text-center py-4">
                <h2 className="text-xl font-bold">¡Gracias por tu opinión!</h2>
                <p className="text-gris">Tu reseña será visible cuando el equipo de Chibson la apruebe.</p>
                <Link to={`/productos/${encodeURIComponent(producto.sku)}`} className={botonDorado}>
                  Volver al producto
                </Link>
              </div>
            ) : (
              <form onSubmit={enviar}>
                <MensajeError mensaje={error} />
                <div className="mb-4">
                  <label htmlFor="calificacion" className="mb-1 block text-sm">
                    Calificación
                  </label>
                  <select
                    id="calificacion"
                    className={campo}
                    required
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {OPCIONES.map(([valor, texto]) => (
                      <option key={valor} value={valor}>
                        {valor} - {texto}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="titulo" className="mb-1 block text-sm">
                    Título
                  </label>
                  <input
                    id="titulo"
                    className={campo}
                    required
                    maxLength={100}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="comentario" className="mb-1 block text-sm">
                    Comentario
                  </label>
                  <textarea
                    id="comentario"
                    className={areaTexto}
                    rows={6}
                    required
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className={botonDorado} disabled={enviando}>
                  {enviando ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DejarResenaPage
