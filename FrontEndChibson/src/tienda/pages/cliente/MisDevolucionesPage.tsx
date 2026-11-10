import { Link, useLocation } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import DevolucionService from '../../services/devolucion.service'
import { ESTADOS_DEVOLUCION, MOTIVOS_DEVOLUCION } from '../../utils/etiquetas'
import { formatearFecha, formatearPrecio, numeroConCeros } from '../../utils/formato'
import { aviso, botonDorado, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const MisDevolucionesPage = () => {
  const { state } = useLocation()
  const { datos, cargando, error, recargar } = useApi(() => DevolucionService.misDevoluciones())
  const devoluciones = [...(datos ?? [])].sort((a, b) => b.numeroSeguimiento - a.numeroSeguimiento)
  const recienCreada = (state as { creada?: boolean } | null)?.creada

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold m-0">Mis devoluciones</h1>
        <Link to="/mis-pedidos" className={botonDorado}>
          Nueva solicitud
        </Link>
      </div>

      {recienCreada && (
        <div className={aviso.exito}>Tu solicitud fue enviada. Te avisaremos cuando sea revisada.</div>
      )}
      {cargando && <Cargando texto="Cargando devoluciones..." />}
      <MensajeError mensaje={error} alReintentar={recargar} />

      {!cargando && !error && devoluciones.length === 0 && (
        <p className="text-gris">
          No tienes solicitudes de devolución. Puedes pedir una desde el detalle de un pedido entregado.
        </p>
      )}

      {devoluciones.length > 0 && (
        <div className="rounded-lg bg-white shadow-sm p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={encabezadoTabla}>
                <TableRow>
                  <TableHead>N° Solicitud</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devoluciones.map((dev) => (
                  <TableRow key={dev.numeroSeguimiento}>
                    <TableCell>DEV-{numeroConCeros(dev.numeroSeguimiento, 3)}</TableCell>
                    <TableCell>
                      <Link to={`/mis-pedidos/${dev.numeroPedido}`} className="font-semibold text-tinta hover:text-ocre hover:underline">
                        #{numeroConCeros(dev.numeroPedido)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {dev.items.map((item) => (
                        <div key={item.idItemDevolucion} className="text-sm">
                          {item.nombreProducto} x{item.cantidad}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-sm">{MOTIVOS_DEVOLUCION[dev.motivo] ?? dev.motivo}</TableCell>
                    <TableCell>{formatearFecha(dev.fechaSolicitud)}</TableCell>
                    <TableCell>
                      <Insignia valor={dev.estado} estados={ESTADOS_DEVOLUCION} />
                      {dev.estado === 'RECHAZADA' && dev.motivoRechazo && (
                        <div className="text-sm text-gris mt-1">{dev.motivoRechazo}</div>
                      )}
                      {dev.estado === 'REEMBOLSADA' && dev.montoReembolsado != null && (
                        <div className="text-sm text-gris mt-1">{formatearPrecio(dev.montoReembolsado)}</div>
                      )}
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

export default MisDevolucionesPage
