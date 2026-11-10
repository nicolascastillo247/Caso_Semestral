import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import { COSTO_ENVIO, useCarrito } from '../../context/CarritoContext'
import useApi from '../../hooks/useApi'
import { mensajeDeError } from '../../api/apiClient'
import PedidoService, { type CompraRespuesta, type MetodoPago } from '../../services/pedido.service'
import UsuarioService, { direccionTexto, tieneDireccion } from '../../services/usuario.service'
import { METODOS_PAGO } from '../../utils/etiquetas'
import { formatearPrecio, numeroConCeros } from '../../utils/formato'
import { anchoCompleto, aviso, botonContorno, botonDorado, campo } from '../../utils/estilos'

export const CheckoutPage = () => {
  const { items, subtotal, vaciar } = useCarrito()
  const { datos: perfil, cargando, error: errorPerfil } = useApi(() => UsuarioService.obtenerPerfil())
  const navigate = useNavigate()

  const [usarOtra, setUsarOtra] = useState(false)
  const [direccion, setDireccion] = useState({ region: '', ciudadComuna: '', condominio: '', numero: '' })
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
  const [simularRechazo, setSimularRechazo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rechazo, setRechazo] = useState<CompraRespuesta | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (items.length === 0 && !rechazo && !enviando) {
    return <Navigate to="/carrito" replace />
  }
  if (cargando) return <Cargando texto="Preparando tu compra..." />

  const perfilConDireccion = tieneDireccion(perfil)
  const usaOtraDireccion = usarOtra || !perfilConDireccion

  const terminarCompra = (respuesta: CompraRespuesta) => {
    if (respuesta.aprobado) {
      vaciar()
      navigate(`/pedido-confirmado/${respuesta.pedido.numeroPedido}`, { replace: true })
    } else {
      setRechazo(respuesta)
      vaciar()
    }
  }

  const confirmar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (!metodoPago) {
      setError('Selecciona un método de pago.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const respuesta = rechazo
        ? await PedidoService.reintentarPago(rechazo.pedido.numeroPedido, metodoPago, simularRechazo)
        : await PedidoService.comprar({
            items: items.map((item) => ({ sku: item.sku, cantidad: item.cantidad })),
            metodoPago,
            usarDireccionDistinta: usaOtraDireccion,
            ...(usaOtraDireccion ? direccion : {}),
            simularRechazo,
          })
      terminarCompra(respuesta)
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo completar la compra.'))
    } finally {
      setEnviando(false)
    }
  }

  const lineas = rechazo
    ? rechazo.pedido.items.map((item) => ({
        sku: item.sku,
        nombre: item.nombreProducto,
        cantidad: item.cantidad,
        total: item.precioUnitario * item.cantidad,
      }))
    : items.map((item) => ({ sku: item.sku, nombre: item.modelo, cantidad: item.cantidad, total: item.precio * item.cantidad }))
  const totalCompra = rechazo ? rechazo.pedido.total : subtotal + COSTO_ENVIO

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>

      {rechazo && (
        <div className={aviso.advertencia}>
          <strong>El pago del pedido #{numeroConCeros(rechazo.pedido.numeroPedido)} fue rechazado.</strong>
          <div>{rechazo.mensaje}</div>
          <div className="text-sm mt-1">Tu pedido quedó pendiente: puedes intentar pagarlo de nuevo con otro método.</div>
        </div>
      )}
      <MensajeError mensaje={error ?? errorPerfil} />

      <form onSubmit={confirmar}>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            {!rechazo && (
              <div className="rounded-lg bg-white shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold">Dirección de envío</h2>
                {perfilConDireccion && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        className="size-4 accent-dorado"
                        type="radio"
                        name="direccion"
                        id="direccion-perfil"
                        checked={!usarOtra}
                        onChange={() => setUsarOtra(false)}
                      />
                      <label htmlFor="direccion-perfil">
                        {direccionTexto(perfil)}
                      </label>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        className="size-4 accent-dorado"
                        type="radio"
                        name="direccion"
                        id="direccion-otra"
                        checked={usarOtra}
                        onChange={() => setUsarOtra(true)}
                      />
                      <label htmlFor="direccion-otra">
                        Enviar a otra dirección
                      </label>
                    </div>
                  </>
                )}
                {!perfilConDireccion && (
                  <p className="text-sm text-gris">
                    Tu perfil no tiene dirección guardada. Ingresa dónde quieres recibir el pedido o{' '}
                    <Link to="/perfil" className="font-semibold text-tinta hover:text-ocre hover:underline">
                      guárdala en tu perfil
                    </Link>
                    .
                  </p>
                )}
                {usaOtraDireccion && (
                  <div className="grid grid-cols-12 gap-4 mt-1">
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="region" className="mb-1 block text-sm">
                        Región
                      </label>
                      <input
                        id="region"
                        className={campo}
                        required
                        value={direccion.region}
                        onChange={(e) => setDireccion({ ...direccion, region: e.target.value })}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="ciudadComuna" className="mb-1 block text-sm">
                        Ciudad o comuna
                      </label>
                      <input
                        id="ciudadComuna"
                        className={campo}
                        required
                        value={direccion.ciudadComuna}
                        onChange={(e) => setDireccion({ ...direccion, ciudadComuna: e.target.value })}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="numero" className="mb-1 block text-sm">
                        Calle y número
                      </label>
                      <input
                        id="numero"
                        className={campo}
                        required
                        value={direccion.numero}
                        onChange={(e) => setDireccion({ ...direccion, numero: e.target.value })}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="condominio" className="mb-1 block text-sm">
                        Depto. o condominio (opcional)
                      </label>
                      <input
                        id="condominio"
                        className={campo}
                        value={direccion.condominio}
                        onChange={(e) => setDireccion({ ...direccion, condominio: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold">Método de pago</h2>
              {(Object.keys(METODOS_PAGO) as MetodoPago[]).map((metodo) => (
                <div className="flex items-center gap-2 mb-2" key={metodo}>
                  <input
                    className="size-4 accent-dorado"
                    type="radio"
                    name="pago"
                    id={metodo}
                    checked={metodoPago === metodo}
                    onChange={() => setMetodoPago(metodo)}
                  />
                  <label htmlFor={metodo}>
                    {METODOS_PAGO[metodo]}
                  </label>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <input
                  className="size-4 accent-dorado"
                  type="checkbox"
                  id="simularRechazo"
                  checked={simularRechazo}
                  onChange={(e) => setSimularRechazo(e.target.checked)}
                />
                <label className="text-sm text-gris" htmlFor="simularRechazo">
                  Simular pago rechazado (demostración)
                </label>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-lg bg-crema p-6">
              <h2 className="text-lg font-bold">Resumen del pedido</h2>
              {lineas.map((linea) => (
                <div key={linea.sku} className="flex justify-between gap-4 mb-2">
                  <span>
                    {linea.nombre} x{linea.cantidad}
                  </span>
                  <strong>{formatearPrecio(linea.total)}</strong>
                </div>
              ))}
              <div className="flex justify-between gap-4 mb-2">
                <span>Despacho</span>
                <strong>{formatearPrecio(rechazo ? rechazo.pedido.costoEnvio : COSTO_ENVIO)}</strong>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-xl">
                <span>Total</span>
                <strong>{formatearPrecio(totalCompra)}</strong>
              </div>
              <button type="submit" className={`${botonDorado}${anchoCompleto} mt-4`} disabled={enviando}>
                {enviando ? 'Procesando pago...' : rechazo ? 'Reintentar pago' : 'Confirmar compra'}
              </button>
              {rechazo ? (
                <Link to="/mis-pedidos" className={`${botonContorno}${anchoCompleto} mt-2`}>
                  Pagar más tarde
                </Link>
              ) : (
                <Link to="/carrito" className={`${botonContorno}${anchoCompleto} mt-2`}>
                  Volver
                </Link>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default CheckoutPage
