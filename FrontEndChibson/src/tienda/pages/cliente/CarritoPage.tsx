import { Link } from 'react-router'
import { COSTO_ENVIO, useCarrito } from '../../context/CarritoContext'
import { formatearPrecio, imagenRespaldo, urlImagen } from '../../utils/formato'
import { anchoCompleto, boton, botonContorno, botonDorado, campo, encabezadoTabla } from '../../utils/estilos'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'

export const CarritoPage = () => {
  const { items, subtotal, cambiarCantidad, quitar, vaciar } = useCarrito()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Carro de compras</h1>
        <p className="mb-4 text-gris">Tu carro está vacío.</p>
        <Link to="/catalogo" className={botonDorado}>
          Ir al catálogo
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold m-0">Carro de compras</h1>
        <button type="button" className={boton('secundario', 'chico')} onClick={vaciar}>
          Vaciar carro
        </button>
      </div>

      <div className="rounded-lg bg-white shadow-sm p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={encabezadoTabla}>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="w-36">Cantidad</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <img
                        src={urlImagen(item.imagenUrl)}
                        onError={imagenRespaldo}
                        alt={item.modelo}
                        className="size-[90px] rounded border bg-white object-contain p-2"
                      />
                      <div>
                        <Link to={`/productos/${encodeURIComponent(item.sku)}`} className="text-tinta hover:text-ocre hover:underline font-bold">
                          {item.modelo}
                        </Link>
                        <div className="text-gris text-sm">
                          {item.marca} · {item.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatearPrecio(item.precio)}</TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(item.stockDisponible, 1)}
                      value={item.cantidad}
                      className={campo}
                      aria-label={`Cantidad de ${item.modelo}`}
                      onChange={(e) => cambiarCantidad(item.sku, Number(e.target.value) || 1)}
                    />
                  </TableCell>
                  <TableCell>{formatearPrecio(item.precio * item.cantidad)}</TableCell>
                  <TableCell>
                    <button type="button" className={boton('peligro', 'chico')} onClick={() => quitar(item.sku)}>
                      Eliminar
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full md:w-5/12 lg:w-1/3">
          <div className="rounded-lg bg-crema p-6">
            <h2 className="text-lg font-bold">Resumen</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <strong>{formatearPrecio(subtotal)}</strong>
            </div>
            <div className="flex justify-between mb-2">
              <span>Despacho</span>
              <strong>{formatearPrecio(COSTO_ENVIO)}</strong>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-xl">
              <span>Total</span>
              <strong>{formatearPrecio(subtotal + COSTO_ENVIO)}</strong>
            </div>
            <p className="text-sm text-gris mt-2 mb-0">Precios con IVA incluido.</p>
            <Link to="/checkout" className={`${botonDorado}${anchoCompleto} mt-4`}>
              Continuar compra
            </Link>
            <Link to="/catalogo" className={`${botonContorno}${anchoCompleto} mt-2`}>
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default CarritoPage
