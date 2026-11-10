import { Link } from 'react-router'
import type { Producto } from '../services/producto.service'
import { anchoCompleto, botonContorno, botonDorado, enlace, insignia, precio, tarjetaHover } from '../utils/estilos'
import { formatearPrecio, imagenRespaldo, recortar, urlImagen } from '../utils/formato'

interface ProductoCardProps {
  producto: Producto
  alComprar: (producto: Producto) => void
}

export const ProductoCard = ({ producto, alComprar }: ProductoCardProps) => {
  const detalle = `/productos/${encodeURIComponent(producto.sku)}`
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ${tarjetaHover}`}>
      <Link to={detalle}>
        <img
          src={urlImagen(producto.imagenUrl)}
          onError={imagenRespaldo}
          alt={producto.modelo}
          className="h-60 w-full bg-white object-contain p-4"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-1 text-sm text-gris">{producto.marca}</p>
        <h3 className="mb-2 text-lg font-bold">
          <Link to={detalle} className={enlace}>
            {producto.modelo}
          </Link>
        </h3>
        <p className={`${precio} my-2`}>{formatearPrecio(producto.precio)}</p>
        <p className="mb-4 text-sm text-gris">{recortar(producto.descripcion, 110)}</p>
        {producto.agotado ? (
          <span className={`${insignia} mb-4 self-start bg-zinc-500 text-white`}>Agotado</span>
        ) : (
          producto.bajoStock && (
            <span className={`${insignia} mb-4 self-start bg-amber-200 text-amber-900`}>Últimas unidades</span>
          )
        )}
        <div className="mt-auto flex flex-col gap-2">
          <Link to={detalle} className={botonContorno + anchoCompleto}>
            Ver detalles
          </Link>
          <button
            type="button"
            className={botonDorado + anchoCompleto}
            disabled={producto.agotado}
            onClick={() => alComprar(producto)}
          >
            {producto.agotado ? 'Sin stock' : 'Agregar al carro'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductoCard
