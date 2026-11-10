import { CircleCheck } from 'lucide-react'
import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import PedidoService from '../../services/pedido.service'
import { ESTADOS_PEDIDO, METODOS_PAGO } from '../../utils/etiquetas'
import { formatearFecha, formatearPrecio, numeroConCeros } from '../../utils/formato'
import { botonContorno, botonDorado } from '../../utils/estilos'

export const ConfirmacionPedidoPage = () => {
  const { numero = '' } = useParams()
  const { datos: pedido, cargando, error, recargar } = useApi(() => PedidoService.miPedido(Number(numero)), [numero])

  if (cargando) return <Cargando texto="Cargando comprobante..." />
  if (error || !pedido) return <MensajeError mensaje={error ?? 'No se encontró el pedido.'} alReintentar={recargar} />

  const unidades = pedido.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <div className="flex justify-center">
      <div className="col-span-12 lg:col-span-7">
        <div className="rounded-lg bg-white shadow-sm p-12 text-center">
          <CircleCheck className="mx-auto mb-2 size-14 fill-green-600 text-white" />
          <h1 className="text-3xl font-bold">Compra realizada correctamente</h1>
          <p className="text-gris">Tu pedido fue registrado y el pago fue aprobado.</p>
          <div className="rounded-lg bg-crema rounded p-6 text-left my-6">
            <p>
              <strong>Número de pedido:</strong> {numeroConCeros(pedido.numeroPedido)}
            </p>
            <p>
              <strong>Fecha:</strong> {formatearFecha(pedido.fecha)}
            </p>
            <p>
              <strong>Estado:</strong> <Insignia valor={pedido.estado} estados={ESTADOS_PEDIDO} />
            </p>
            <p>
              <strong>Método de pago:</strong> {pedido.metodoPago ? METODOS_PAGO[pedido.metodoPago] : '—'}
            </p>
            <p>
              <strong>Productos:</strong> {unidades}
            </p>
            <p className="mb-0">
              <strong>Total:</strong> {formatearPrecio(pedido.total)}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Link to={`/mis-pedidos/${pedido.numeroPedido}`} className={botonDorado}>
              Ver pedido
            </Link>
            <Link to="/" className={botonContorno}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionPedidoPage
