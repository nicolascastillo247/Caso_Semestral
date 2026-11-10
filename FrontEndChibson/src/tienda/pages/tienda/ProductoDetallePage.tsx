import { useState } from 'react'
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table'
import { Link, useParams } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import Migas from '../../components/Migas'
import ModalLoginRequerido from '../../components/ModalLoginRequerido'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import useComprar from '../../hooks/useComprar'
import { useProducto } from '../../hooks/useProductos'
import ResenaService from '../../services/resena.service'
import { CATEGORIAS_PRODUCTO } from '../../utils/etiquetas'
import { boton, campoBase, divisor, encabezadoTabla, enlace, tarjeta, tarjetaCrema, tituloSeccion } from '../../utils/estilos'
import { estrellas, formatearFechaLarga, formatearPrecio, imagenRespaldo, urlImagen } from '../../utils/formato'

export const ProductoDetallePage = () => {
  const { sku = '' } = useParams()
  const { producto, cargando, error, recargar } = useProducto(sku)
  const { datos: opiniones } = useApi(() => ResenaService.listarAprobadas(sku), [sku])
  const { esCliente } = useAuth()
  const { comprar, modalVisible, redireccionLogin, cerrarModal } = useComprar()
  const [cantidad, setCantidad] = useState(1)

  if (cargando) return <Cargando texto="Cargando producto..." />
  if (error || !producto) {
    return (
      <div className="space-y-4">
        <MensajeError mensaje={error ?? 'El producto no existe.'} alReintentar={recargar} />
        <Link to="/catalogo" className={enlace}>
          ← Volver al catálogo
        </Link>
      </div>
    )
  }

  const resenas = opiniones?.resenas ?? []
  const promedio = opiniones?.promedio ?? 0
  const total = opiniones?.total ?? 0
  const categoria = CATEGORIAS_PRODUCTO[producto.categoria] ?? producto.categoria

  return (
    <>
      <Migas
        pasos={[
          { texto: 'Catálogo', to: '/catalogo' },
          { texto: categoria, to: `/catalogo?categoria=${producto.categoria}` },
          { texto: producto.modelo },
        ]}
      />

      <article className="mb-10 grid items-start gap-10 lg:grid-cols-2">
        <div className={`${tarjeta} text-center`}>
          <img
            src={urlImagen(producto.imagenUrl)}
            onError={imagenRespaldo}
            alt={producto.modelo}
            className="mx-auto max-h-[420px] max-w-full object-contain"
          />
        </div>

        <div>
          <p className="mb-1 text-gris">{producto.marca}</p>
          <h2 className="mb-4 text-3xl font-bold">{producto.modelo}</h2>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-bold">
              {total > 0 ? `${estrellas(promedio)} (${promedio.toFixed(1)} de 5)` : 'Sin valoraciones aún'}
            </span>
            <span className="text-gris">|</span>
            <a href="#seccion-resenas" className={enlace}>
              Ver {total} {total === 1 ? 'valoración' : 'valoraciones'}
            </a>
            <span className="text-gris">|</span>
            <span className="text-gris">
              SKU: <strong className="text-tinta">{producto.sku}</strong>
            </span>
          </div>

          <p className="my-4 text-3xl font-bold text-ocre">{formatearPrecio(producto.precio)}</p>
          {producto.agotado ? (
            <p className="mb-6 inline-block rounded-md border bg-zinc-100 px-3 py-2 font-semibold text-zinc-600">Sin stock</p>
          ) : (
            <p className="mb-6 inline-block rounded-md border border-green-200 bg-green-50 px-3 py-2 font-semibold text-green-700">
              En stock ({producto.stockDisponible} {producto.stockDisponible === 1 ? 'unidad disponible' : 'unidades disponibles'})
            </p>
          )}

          {producto.descripcion && <p className="mb-6">{producto.descripcion}</p>}

          {!producto.agotado && (
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="cantidad">Cantidad</label>
              <input
                id="cantidad"
                type="number"
                className={`${campoBase} h-10 w-24`}
                min={1}
                max={producto.stockDisponible}
                value={cantidad}
                onChange={(e) =>
                  setCantidad(Math.max(1, Math.min(Number(e.target.value) || 1, producto.stockDisponible)))
                }
              />
            </div>
          )}

          <button
            type="button"
            className={`${boton('dorado', 'grande')} w-full`}
            disabled={producto.agotado}
            onClick={() => comprar(producto, cantidad)}
          >
            {producto.agotado ? 'Sin stock' : 'Agregar al carro'}
          </button>
        </div>
      </article>

      <hr className={divisor} />

      <section id="ficha-tecnica" className="mb-10">
        <h3 className={tituloSeccion}>Ficha Técnica</h3>
        {producto.especificaciones?.length ? (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <Table>
              <TableCaption className="p-3">Especificaciones técnicas y componentes del instrumento</TableCaption>
              <TableHeader className={encabezadoTabla}>
                <TableRow>
                  <TableHead className="w-1/2">Característica</TableHead>
                  <TableHead className="w-1/2">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {producto.especificaciones.map((esp) => (
                  <TableRow key={esp.clave} className="even:bg-fondo">
                    <TableCell>{esp.clave}</TableCell>
                    <TableCell>{esp.valor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gris">Este producto todavía no tiene ficha técnica.</p>
        )}
      </section>

      <hr className={divisor} />

      <section id="seccion-resenas">
        <h3 className={tituloSeccion}>Reseñas de Clientes</h3>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className={`${tarjetaCrema} h-full`}>
            <h4 className="mb-3 text-lg font-bold">Puntuación General</h4>
            <p className="mb-0 text-4xl font-bold">{total > 0 ? promedio.toFixed(1) : '—'}</p>
            <p className="mb-4 text-sm text-gris">de 5 estrellas</p>
            <ul className="flex flex-col gap-1 text-sm">
              {[5, 4, 3, 2, 1].map((nivel) => {
                const cantidadNivel = resenas.filter((r) => r.calificacion === nivel).length
                return (
                  <li key={nivel}>
                    {nivel} {nivel === 1 ? 'estrella' : 'estrellas'}:{' '}
                    <strong>
                      {cantidadNivel} {cantidadNivel === 1 ? 'opinión' : 'opiniones'}
                    </strong>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4 md:col-span-2">
            {resenas.length === 0 && <p className="text-gris">Todavía no hay reseñas para este producto.</p>}
            {resenas.map((resena) => (
              <article key={resena.idResena} className="rounded-lg bg-white p-4 shadow-sm">
                <h5 className="mb-1 text-base font-bold">
                  {resena.titulo} — {estrellas(resena.calificacion)}
                </h5>
                <p className="mb-2 text-sm text-gris">
                  Por <strong>{resena.nombreCliente}</strong> el {formatearFechaLarga(resena.fecha)} (Compra verificada)
                </p>
                {resena.comentario && <p className="mb-0 text-sm">{resena.comentario}</p>}
                {resena.respuestaAdmin && (
                  <div className="mt-2 rounded bg-fondo p-2 text-sm">
                    <strong>Respuesta de Chibson:</strong> {resena.respuestaAdmin}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className={tarjetaCrema}>
          <h4 className="mb-2 text-lg font-bold">Dejar una reseña sobre este producto</h4>
          {esCliente ? (
            <p className="mb-0 text-sm">
              Si ya recibiste este producto, puedes{' '}
              <Link to={`/productos/${encodeURIComponent(producto.sku)}/resena`} className={`${enlace} font-bold`}>
                escribir tu reseña
              </Link>
              .
            </p>
          ) : (
            <p className="mb-0 text-sm">
              Debes{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(`/productos/${producto.sku}`)}`}
                className={`${enlace} font-bold`}
              >
                iniciar sesión
              </Link>{' '}
              o{' '}
              <Link to="/registro" className={`${enlace} font-bold`}>
                registrarte
              </Link>{' '}
              para poder calificar y opinar sobre este producto.
            </p>
          )}
        </div>
      </section>

      <ModalLoginRequerido visible={modalVisible} redireccion={redireccionLogin} alCerrar={cerrarModal} />
    </>
  )
}

export default ProductoDetallePage
