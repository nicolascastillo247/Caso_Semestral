import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import Insignia from '../../components/Insignia'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import { mensajeDeError } from '../../api/apiClient'
import PedidoService, { type MetodoPago } from '../../services/pedido.service'
import { ESTADOS_PEDIDO, METODOS_PAGO } from '../../utils/etiquetas'
import { formatearFechaHora, formatearPrecio, numeroConCeros } from '../../utils/formato'
import { aviso, boton, botonDorado, botonPeligro, campoBase, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const PedidoDetallePage = () => {
  const { numero = '' } = useParams()
  const { datos: pedido, cargando, error, recargar } = useApi(() => PedidoService.miPedido(Number(numero)), [numero])
  const [metodo, setMetodo] = useState<MetodoPago>('DEBITO')
  const [pagando, setPagando] = useState(false)
  const [mensajePago, setMensajePago] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null)

  if (cargando) return <Cargando texto="Cargando pedido..." />
  if (error || !pedido) {
    return (
      <>
        <MensajeError mensaje={error ?? 'No se encontró el pedido.'} alReintentar={recargar} />
        <Link to="/mis-pedidos" className="font-semibold text-tinta hover:text-ocre hover:underline">
          ← Volver a mis pedidos
        </Link>
      </>
    )
  }

  const pagar = async () => {
    setPagando(true)
    setMensajePago(null)
    try {
      const respuesta = await PedidoService.reintentarPago(pedido.numeroPedido, metodo)
      setMensajePago({ tipo: respuesta.aprobado ? 'success' : 'danger', texto: respuesta.mensaje })
      await recargar()
    } catch (err) {
      setMensajePago({ tipo: 'danger', texto: mensajeDeError(err) })
    } finally {
      setPagando(false)
    }
  }

  const entregado = pedido.estado === 'ENTREGADO'
  const direccion = pedido.direccion
    ? [pedido.direccion.numero, pedido.direccion.condominio, pedido.direccion.ciudadComuna, pedido.direccion.region]
        .filter(Boolean)
        .join(', ')
    : '—'

  return (
    <>
      <Link to="/mis-pedidos" className="font-semibold text-tinta hover:text-ocre hover:underline inline-block mb-4">
        ← Volver a mis pedidos
      </Link>
      <h1 className="text-3xl font-bold">Pedido #{numeroConCeros(pedido.numeroPedido)}</h1>
      <p className="mb-6">
        Estado actual: <Insignia valor={pedido.estado} estados={ESTADOS_PEDIDO} />
      </p>

      {mensajePago && <div className={aviso[mensajePago.tipo === 'success' ? 'exito' : 'error']}>{mensajePago.texto}</div>}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg bg-white shadow-sm p-6">
            <h2 className="text-xl font-bold">Productos</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className={encabezadoTabla}>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Subtotal</TableHead>
                    {entregado && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedido.items.map((item) => (
                    <TableRow key={item.idItem}>
                      <TableCell>
                        <Link to={`/productos/${encodeURIComponent(item.sku)}`} className="font-semibold text-tinta hover:text-ocre hover:underline">
                          {item.nombreProducto}
                        </Link>
                      </TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>{formatearPrecio(item.precioUnitario * item.cantidad)}</TableCell>
                      {entregado && (
                        <TableCell className="text-right">
                          <Link
                            to={`/productos/${encodeURIComponent(item.sku)}/resena`}
                            className={boton('contorno', 'chico')}
                          >
                            Dejar reseña
                          </Link>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <span>Despacho</span>
              <strong>{formatearPrecio(pedido.costoEnvio)}</strong>
            </div>
            <div className="flex justify-between text-sm text-gris">
              <span>IVA incluido</span>
              <span>{formatearPrecio(pedido.iva)}</span>
            </div>
            <div className="flex justify-between text-xl mt-2">
              <span>Total</span>
              <strong>{formatearPrecio(pedido.total)}</strong>
            </div>

            {entregado && (
              <div className="flex flex-wrap gap-2 mt-6">
                <Link to={`/mis-pedidos/${pedido.numeroPedido}/devolucion`} className={botonPeligro}>
                  Solicitar devolución
                </Link>
              </div>
            )}

            {pedido.estado === 'PENDIENTE' && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-base font-bold">Pago pendiente</h3>
                <div className="flex flex-wrap gap-2">
                  <select
                    className={`${campoBase} h-10 w-auto`}
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value as MetodoPago)}
                    aria-label="Método de pago"
                  >
                    {(Object.keys(METODOS_PAGO) as MetodoPago[]).map((m) => (
                      <option key={m} value={m}>
                        {METODOS_PAGO[m]}
                      </option>
                    ))}
                  </select>
                  <button type="button" className={botonDorado} disabled={pagando} onClick={pagar}>
                    {pagando ? 'Procesando...' : 'Pagar pedido'}
                  </button>
                </div>
              </div>
            )}

            {pedido.motivoCancelacion && (
              <div className="mt-6 rounded-md border bg-zinc-100 p-4 text-sm">
                <strong>Motivo de cancelación:</strong> {pedido.motivoCancelacion}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg bg-crema p-6 mb-6">
            <h2 className="text-lg font-bold">Despacho</h2>
            <p className="mb-1">{direccion}</p>
            <p className="text-sm text-gris mb-0">
              Pago: {pedido.metodoPago ? METODOS_PAGO[pedido.metodoPago] : 'Pendiente'}
            </p>
          </div>
          <div className="rounded-lg bg-crema p-6">
            <h2 className="text-lg font-bold">Historial de estado</h2>
            <ul className="mb-0 flex flex-col gap-2 text-sm">
              {pedido.historial.map((h) => (
                <li key={h.idHistorial}>
                  <strong>{formatearFechaHora(h.fecha)}</strong> — {ESTADOS_PEDIDO[h.estadoNuevo]?.texto ?? h.estadoNuevo}
                </li>
              ))}
              {pedido.historial.length === 0 && <li className="text-gris">Sin movimientos.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default PedidoDetallePage
