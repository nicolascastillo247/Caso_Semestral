import { Link } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useMisPedidos from '../../hooks/useMisPedidos'
import { ESTADOS_PEDIDO } from '../../utils/etiquetas'
import { formatearFecha, formatearPrecio, numeroConCeros } from '../../utils/formato'
import { boton, botonDorado, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const MisPedidosPage = () => {
  const { pedidos, cargando, error, recargar } = useMisPedidos()

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Mis pedidos</h1>
      {cargando && <Cargando texto="Cargando pedidos..." />}
      <MensajeError mensaje={error} alReintentar={recargar} />

      {!cargando && !error && pedidos.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gris">Aún no has realizado compras.</p>
          <Link to="/catalogo" className={botonDorado}>
            Ir al catálogo
          </Link>
        </div>
      )}

      {pedidos.length > 0 && (
        <div className="rounded-lg bg-white shadow-sm p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={encabezadoTabla}>
                <TableRow>
                  <TableHead>N° Pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.numeroPedido}>
                    <TableCell>
                      <strong>{numeroConCeros(pedido.numeroPedido)}</strong>
                    </TableCell>
                    <TableCell>{formatearFecha(pedido.fecha)}</TableCell>
                    <TableCell>{formatearPrecio(pedido.total)}</TableCell>
                    <TableCell>
                      <Insignia valor={pedido.estado} estados={ESTADOS_PEDIDO} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/mis-pedidos/${pedido.numeroPedido}`} className={boton('contorno', 'chico')}>
                        Ver detalle
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

export default MisPedidosPage
