import { Link, useLocation } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import TicketService from '../../services/ticket.service'
import { CATEGORIAS_TICKET, ESTADOS_TICKET } from '../../utils/etiquetas'
import { formatearFecha, numeroConCeros } from '../../utils/formato'
import { aviso, boton, botonDorado, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const MisTicketsPage = () => {
  const { state } = useLocation()
  const { datos, cargando, error, recargar } = useApi(() => TicketService.misTickets())
  const tickets = [...(datos ?? [])].sort((a, b) => b.numeroTicket - a.numeroTicket)
  const creado = (state as { creado?: number } | null)?.creado

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold m-0">Mis solicitudes de soporte</h1>
        <Link to="/soporte/nuevo" className={botonDorado}>
          Nuevo ticket
        </Link>
      </div>

      {creado && (
        <div className={aviso.exito}>
          Creamos tu ticket TCK-{numeroConCeros(creado, 3)}. Te responderemos a la brevedad.
        </div>
      )}
      {cargando && <Cargando texto="Cargando tickets..." />}
      <MensajeError mensaje={error} alReintentar={recargar} />

      {!cargando && !error && tickets.length === 0 && <p className="text-gris">No tienes tickets de soporte.</p>}

      {tickets.length > 0 && (
        <div className="rounded-lg bg-white shadow-sm p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={encabezadoTabla}>
                <TableRow>
                  <TableHead>N° Ticket</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.numeroTicket}>
                    <TableCell>TCK-{numeroConCeros(ticket.numeroTicket, 3)}</TableCell>
                    <TableCell>{ticket.asunto}</TableCell>
                    <TableCell>{CATEGORIAS_TICKET[ticket.categoria] ?? ticket.categoria}</TableCell>
                    <TableCell>{formatearFecha(ticket.fechaCreacion)}</TableCell>
                    <TableCell>
                      <Insignia valor={ticket.estado} estados={ESTADOS_TICKET} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/soporte/${ticket.numeroTicket}`} className={boton('contorno', 'chico')}>
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  )
}

export default MisTicketsPage
