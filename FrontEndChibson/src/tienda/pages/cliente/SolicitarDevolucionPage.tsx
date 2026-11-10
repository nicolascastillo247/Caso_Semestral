import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import { mensajeDeError } from '../../api/apiClient'
import DevolucionService, { type MotivoDevolucion } from '../../services/devolucion.service'
import PedidoService from '../../services/pedido.service'
import { MOTIVOS_DEVOLUCION } from '../../utils/etiquetas'
import { numeroConCeros } from '../../utils/formato'
import { areaTexto, aviso, botonDorado, campo, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const SolicitarDevolucionPage = () => {
  const { numero = '' } = useParams()
  const navigate = useNavigate()
  const { datos: pedido, cargando, error: errorPedido } = useApi(() => PedidoService.miPedido(Number(numero)), [numero])

  const [cantidades, setCantidades] = useState<Record<string, number>>({})
  const [motivo, setMotivo] = useState<MotivoDevolucion | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [evidenciaUrl, setEvidenciaUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <Cargando texto="Cargando pedido..." />
  if (errorPedido || !pedido) return <MensajeError mensaje={errorPedido ?? 'No se encontró el pedido.'} />

  if (pedido.estado !== 'ENTREGADO') {
    return (
      <div className={aviso.info}>
        Solo puedes pedir la devolución de un pedido entregado.{' '}
        <Link to={`/mis-pedidos/${pedido.numeroPedido}`} className="font-semibold text-tinta hover:text-ocre hover:underline">
          Volver al pedido
        </Link>
      </div>
    )
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    const items = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([sku, cantidad]) => ({ sku, cantidad }))
    if (items.length === 0) {
      setError('Selecciona al menos un producto y la cantidad a devolver.')
      return
    }
    if (!motivo) {
      setError('Selecciona el motivo de la devolución.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await DevolucionService.solicitar({
        numeroPedido: pedido.numeroPedido,
        items,
        motivo,
        descripcion,
        evidenciaUrl: evidenciaUrl.trim() || undefined,
      })
      navigate('/devoluciones', { replace: true, state: { creada: true } })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar la solicitud.'))
      setEnviando(false)
    }
  }

  return (
    <>
      <Link to={`/mis-pedidos/${pedido.numeroPedido}`} className="font-semibold text-tinta hover:text-ocre hover:underline inline-block mb-4">
        ← Volver al pedido
      </Link>
      <h1 className="text-3xl font-bold mb-6">Solicitar devolución</h1>

      <div className="rounded-lg bg-white shadow-sm p-6">
        <form onSubmit={enviar}>
          <MensajeError mensaje={error} />
          <p className="font-semibold">Pedido #{numeroConCeros(pedido.numeroPedido)}</p>

          <div className="overflow-x-auto mb-4">
            <Table>
              <TableHeader className={encabezadoTabla}>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Comprados</TableHead>
                  <TableHead className="w-40">A devolver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.items.map((item) => (
                  <TableRow key={item.idItem}>
                    <TableCell>{item.nombreProducto}</TableCell>
                    <TableCell>{item.cantidad}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        className={campo}
                        min={0}
                        max={item.cantidad}
                        value={cantidades[item.sku] ?? 0}
                        aria-label={`Cantidad a devolver de ${item.nombreProducto}`}
                        onChange={(e) =>
                          setCantidades({
                            ...cantidades,
                            [item.sku]: Math.max(0, Math.min(Number(e.target.value) || 0, item.cantidad)),
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <label htmlFor="motivo" className="mb-1 block text-sm">
                Motivo
              </label>
              <select
                id="motivo"
                className={campo}
                required
                value={motivo}
                onChange={(e) => setMotivo(e.target.value as MotivoDevolucion)}
              >
                <option value="">Seleccione</option>
                {Object.entries(MOTIVOS_DEVOLUCION).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-12 md:col-span-6">
              <label htmlFor="evidencia" className="mb-1 block text-sm">
                Evidencia (enlace a una imagen, opcional)
              </label>
              <input
                id="evidencia"
                type="url"
                className={campo}
                placeholder="https://..."
                value={evidenciaUrl}
                onChange={(e) => setEvidenciaUrl(e.target.value)}
              />
            </div>
            <div className="col-span-12">
              <label htmlFor="descripcion" className="mb-1 block text-sm">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className={areaTexto}
                rows={5}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
            </div>
          </div>

          <button type="submit" className={`${botonDorado} mt-6`} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </>
  )
}

export default SolicitarDevolucionPage
