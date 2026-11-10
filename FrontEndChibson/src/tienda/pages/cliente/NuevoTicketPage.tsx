import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import MensajeError from '../../components/MensajeError'
import { mensajeDeError } from '../../api/apiClient'
import TicketService, { type CategoriaTicket } from '../../services/ticket.service'
import { CATEGORIAS_TICKET } from '../../utils/etiquetas'
import { areaTexto, botonDorado, campo } from '../../utils/estilos'

export const NuevoTicketPage = () => {
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState<CategoriaTicket | ''>('')
  const [asunto, setAsunto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [adjuntoUrl, setAdjuntoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!categoria) {
      setError('Selecciona una categoría.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const ticket = await TicketService.crear({
        categoria,
        asunto,
        descripcion,
        adjuntoUrl: adjuntoUrl.trim() || undefined,
      })
      navigate('/soporte', { replace: true, state: { creado: ticket.numeroTicket } })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear el ticket.'))
      setEnviando(false)
    }
  }

  return (
    <>
      <Link to="/soporte" className="font-semibold text-tinta hover:text-ocre hover:underline inline-block mb-4">
        ← Volver a mis tickets
      </Link>
      <h1 className="text-3xl font-bold mb-6">Crear solicitud de soporte</h1>
      <div className="rounded-lg bg-white shadow-sm p-6">
        <form onSubmit={enviar}>
          <MensajeError mensaje={error} />
          <div className="mb-4">
            <label htmlFor="categoria" className="mb-1 block text-sm">
              Categoría
            </label>
            <select
              id="categoria"
              className={campo}
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaTicket)}
            >
              <option value="">Seleccione</option>
              {Object.entries(CATEGORIAS_TICKET).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="asunto" className="mb-1 block text-sm">
              Asunto
            </label>
            <input
              id="asunto"
              className={campo}
              required
              maxLength={150}
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="mb-1 block text-sm">
              Descripción
            </label>
            <textarea
              id="descripcion"
              className={areaTexto}
              rows={6}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="adjunto" className="mb-1 block text-sm">
              Adjunto (enlace a una imagen o documento, opcional)
            </label>
            <input
              id="adjunto"
              type="url"
              className={campo}
              placeholder="https://..."
              value={adjuntoUrl}
              onChange={(e) => setAdjuntoUrl(e.target.value)}
            />
          </div>
          <button type="submit" className={botonDorado} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar ticket'}
          </button>
        </form>
      </div>
    </>
  )
}

export default NuevoTicketPage
