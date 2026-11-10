import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import { mensajeDeError } from '../../api/apiClient'
import TicketService from '../../services/ticket.service'
import { CATEGORIAS_TICKET, ESTADOS_TICKET } from '../../utils/etiquetas'
import { estrellas, formatearFechaHora, numeroConCeros } from '../../utils/formato'
import { areaTexto, botonDorado, campo, insignia } from '../../utils/estilos'

const OPCIONES_CALIFICACION = [
  [5, 'Excelente'],
  [4, 'Buena'],
  [3, 'Regular'],
  [2, 'Mala'],
  [1, 'Muy mala'],
] as const

export const TicketDetallePage = () => {
  const { numero = '' } = useParams()
  const { datos: ticket, cargando, error, recargar } = useApi(() => TicketService.miTicket(Number(numero)), [numero])
  const [calificacion, setCalificacion] = useState('')
  const [comentario, setComentario] = useState('')
  const [errorCierre, setErrorCierre] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <Cargando texto="Cargando ticket..." />
  if (error || !ticket) {
    return (
      <>
        <MensajeError mensaje={error ?? 'No se encontró el ticket.'} alReintentar={recargar} />
        <Link to="/soporte" className="font-semibold text-tinta hover:text-ocre hover:underline">
          ← Volver a mis tickets
        </Link>
      </>
    )
  }

  const cerrar = async (evento: FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setErrorCierre(null)
    try {
      await TicketService.cerrar(ticket.numeroTicket, { calificacion: Number(calificacion), comentario })
      await recargar()
    } catch (err) {
      setErrorCierre(mensajeDeError(err, 'No se pudo cerrar el ticket.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Link to="/soporte" className="font-semibold text-tinta hover:text-ocre hover:underline inline-block mb-4">
        ← Volver a mis tickets
      </Link>
      <h1 className="text-3xl font-bold">Ticket #TCK-{numeroConCeros(ticket.numeroTicket, 3)}</h1>
      <p className="flex flex-wrap gap-2 items-center">
        <Insignia valor={ticket.estado} estados={ESTADOS_TICKET} />
        <span className={`${insignia} bg-fondo border`}>{CATEGORIAS_TICKET[ticket.categoria] ?? ticket.categoria}</span>
        <span className="text-sm text-gris">Creado el {formatearFechaHora(ticket.fechaCreacion)}</span>
      </p>

      <div className="rounded-lg bg-white shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{ticket.asunto}</h2>

        <div className="flex flex-col gap-4">
          <div className="p-4 rounded bg-fondo">
            <strong>Tú</strong> <span className="text-sm text-gris">· {formatearFechaHora(ticket.fechaCreacion)}</span>
            <p className="mb-0 mt-1">{ticket.descripcion}</p>
            {ticket.adjuntoUrl && (
              <a href={ticket.adjuntoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-tinta hover:text-ocre hover:underline">
                Ver adjunto
              </a>
            )}
          </div>

          {ticket.mensajes.map((mensaje) => (
            <div
              key={mensaje.idMensaje}
              className={`p-3 rounded ${mensaje.esAdministrador ? 'border bg-crema' : 'bg-fondo'}`}
            >
              <strong>{mensaje.esAdministrador ? 'Soporte Chibson' : 'Tú'}</strong>{' '}
              <span className="text-sm text-gris">· {formatearFechaHora(mensaje.fecha)}</span>
              <p className="mb-0 mt-1">{mensaje.contenido}</p>
            </div>
          ))}

          {ticket.mensajes.length === 0 && (
            <p className="text-gris text-sm mb-0">Aún no hay respuestas del equipo de soporte.</p>
          )}
        </div>
      </div>

      {ticket.estado === 'RESUELTO' && (
        <div className="rounded-lg bg-white shadow-sm p-6">
          <h2 className="text-xl font-bold">Calificar atención y cerrar</h2>
          <form onSubmit={cerrar}>
            <MensajeError mensaje={errorCierre} />
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
                {OPCIONES_CALIFICACION.map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {valor} - {texto}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="comentario" className="mb-1 block text-sm">
                Comentario
              </label>
              <textarea
                id="comentario"
                className={areaTexto}
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className={botonDorado} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </form>
        </div>
      )}

      {ticket.estado === 'CERRADO' && ticket.calificacion != null && (
        <div className="rounded-md border bg-zinc-100 p-4 text-sm">
          Calificaste esta atención con <strong>{estrellas(ticket.calificacion)}</strong>
          {ticket.comentarioCalificacion && <>: “{ticket.comentarioCalificacion}”</>}
        </div>
      )}
    </>
  )
}

export default TicketDetallePage
