import { Link } from 'react-router'
import Cargando from '../../components/Cargando'
import CarruselNoticias from '../../components/CarruselNoticias'
import ContactoSection from '../../components/ContactoSection'
import MensajeError from '../../components/MensajeError'
import ModalLoginRequerido from '../../components/ModalLoginRequerido'
import NoticiaCard from '../../components/NoticiaCard'
import ProductoCard from '../../components/ProductoCard'
import { useAuth } from '../../context/AuthContext'
import useComprar from '../../hooks/useComprar'
import useNoticias from '../../hooks/useNoticias'
import useProductos from '../../hooks/useProductos'
import { CATEGORIAS_PRODUCTO } from '../../utils/etiquetas'
import { botonDorado, divisor, enlace, tarjetaCrema, tituloSeccion } from '../../utils/estilos'

export const InicioPage = () => {
  const { sesion } = useAuth()
  const { productos, cargando, error, recargar } = useProductos()
  const { noticias } = useNoticias()
  const { comprar, modalVisible, redireccionLogin, cerrarModal } = useComprar()

  const destacados = [...productos].filter((p) => !p.agotado).slice(0, 4)

  return (
    <>
      {noticias.length > 0 && (
        <>
          <section className="my-6">
            <CarruselNoticias noticias={noticias.slice(0, 3)} />
          </section>
          <hr className={divisor} />
        </>
      )}

      <section className="grid items-center gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-3xl font-bold">
            {sesion ? `Hola, ${sesion.nombres}` : 'Encuentra tu próximo instrumento'}
          </h2>
          <p className="mb-6 text-lg">
            Explora nuestro catálogo con las mejores marcas, asesoría técnica y envíos a todo el país.
          </p>
          <Link to="/catalogo" className={botonDorado}>
            Ver catálogo
          </Link>
        </div>
        <div>
          <div className={tarjetaCrema}>
            <h3 className="mb-3 text-lg font-bold">Categorías</h3>
            <ul className="flex flex-col gap-2">
              {Object.entries(CATEGORIAS_PRODUCTO).map(([codigo, nombre]) => (
                <li key={codigo}>
                  <Link to={`/catalogo?categoria=${codigo}`} className="inline-block font-medium transition hover:translate-x-1 hover:text-[#6d5b00]">
                    → {nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <hr className={divisor} />

      <section>
        <h3 className={tituloSeccion}>Instrumentos Destacados</h3>
        {cargando && <Cargando texto="Cargando productos..." />}
        <MensajeError mensaje={error} alReintentar={recargar} />
        {!cargando && !error && destacados.length === 0 && (
          <p className="text-gris">Aún no hay productos disponibles.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((producto) => (
            <ProductoCard key={producto.sku} producto={producto} alComprar={comprar} />
          ))}
        </div>
      </section>

      {noticias.length > 0 && (
        <>
          <hr className={divisor} />
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Últimas Noticias y Artículos</h3>
              <Link to="/noticias" className={enlace}>
                Ver todas →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {noticias.slice(0, 2).map((noticia) => (
                <NoticiaCard key={noticia.idNoticia} noticia={noticia} />
              ))}
            </div>
          </section>
        </>
      )}

      <hr className={divisor} />
      <ContactoSection />

      <ModalLoginRequerido visible={modalVisible} redireccion={redireccionLogin} alCerrar={cerrarModal} />
    </>
  )
}

export default InicioPage
