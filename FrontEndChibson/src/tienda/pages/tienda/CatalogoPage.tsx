import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import Cargando from '../../components/Cargando'
import MensajeError from '../../components/MensajeError'
import ModalLoginRequerido from '../../components/ModalLoginRequerido'
import ProductoCard from '../../components/ProductoCard'
import useComprar from '../../hooks/useComprar'
import useProductos from '../../hooks/useProductos'
import { CATEGORIAS_PRODUCTO } from '../../utils/etiquetas'
import { boton, botonDorado, campo, campoBase, casilla, tarjetaCrema, tituloPagina } from '../../utils/estilos'

type Orden = 'relevancia' | 'precio_asc' | 'precio_desc' | 'recientes'

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export const CatalogoPage = () => {
  const [parametros, setParametros] = useSearchParams()
  const { productos, cargando, error, recargar } = useProductos()
  const { comprar, modalVisible, redireccionLogin, cerrarModal } = useComprar()

  const texto = parametros.get('q') ?? ''
  const categorias = parametros.getAll('categoria')
  const [busqueda, setBusqueda] = useState(texto)
  const [marcas, setMarcas] = useState<string[]>([])
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [soloStock, setSoloStock] = useState(false)
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [verFiltros, setVerFiltros] = useState(categorias.length > 0)

  const marcasDisponibles = useMemo(
    () => [...new Set(productos.map((p) => p.marca).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [productos],
  )

  const filtrados = useMemo(() => {
    const consulta = normalizar(texto.trim())
    const min = precioMin === '' ? null : Number(precioMin)
    const max = precioMax === '' ? null : Number(precioMax)
    const resultado = productos.filter((p) => {
      const enTexto =
        !consulta ||
        normalizar(`${p.modelo} ${p.marca} ${CATEGORIAS_PRODUCTO[p.categoria] ?? p.categoria}`).includes(consulta)
      return (
        enTexto &&
        (categorias.length === 0 || categorias.includes(p.categoria)) &&
        (marcas.length === 0 || marcas.includes(p.marca)) &&
        (min === null || p.precio >= min) &&
        (max === null || p.precio <= max) &&
        (!soloStock || !p.agotado)
      )
    })
    switch (orden) {
      case 'precio_asc':
        return resultado.sort((a, b) => a.precio - b.precio)
      case 'precio_desc':
        return resultado.sort((a, b) => b.precio - a.precio)
      case 'recientes':
        return resultado.sort((a, b) => (b.fechaModificacion ?? '').localeCompare(a.fechaModificacion ?? ''))
      default:
        return resultado
    }
  }, [productos, texto, categorias, marcas, precioMin, precioMax, soloStock, orden])

  const buscar = (evento: FormEvent) => {
    evento.preventDefault()
    const nuevos = new URLSearchParams(parametros)
    if (busqueda.trim()) nuevos.set('q', busqueda.trim())
    else nuevos.delete('q')
    setParametros(nuevos)
  }

  const alternarCategoria = (codigo: string) => {
    const nuevos = new URLSearchParams(parametros)
    const actuales = nuevos.getAll('categoria')
    nuevos.delete('categoria')
    const siguientes = actuales.includes(codigo) ? actuales.filter((c) => c !== codigo) : [...actuales, codigo]
    siguientes.forEach((c) => nuevos.append('categoria', c))
    setParametros(nuevos)
  }

  const alternarMarca = (marca: string) =>
    setMarcas((actuales) => (actuales.includes(marca) ? actuales.filter((m) => m !== marca) : [...actuales, marca]))

  const limpiar = () => {
    setBusqueda('')
    setMarcas([])
    setPrecioMin('')
    setPrecioMax('')
    setSoloStock(false)
    setParametros(new URLSearchParams())
  }

  return (
    <>
      <h2 className={tituloPagina}>Catálogo de Instrumentos</h2>

      <div className="mb-6 grid items-center gap-3 md:grid-cols-3">
        <form className="flex gap-2 md:col-span-2" onSubmit={buscar} role="search">
          <input
            type="search"
            className={campo}
            placeholder="Modelo, marca o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar instrumentos"
          />
          <button type="submit" className={botonDorado}>
            Buscar
          </button>
        </form>
        <div className="md:text-right">
          <button type="button" className={`${botonDorado} w-full md:w-auto`} onClick={() => setVerFiltros(!verFiltros)}>
            {verFiltros ? 'Ocultar filtros' : 'Filtrar resultados'}
          </button>
        </div>
      </div>

      {verFiltros && (
        <div className={`${tarjetaCrema} mb-6`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-3 text-base font-bold">Categoría</h3>
              {Object.entries(CATEGORIAS_PRODUCTO).map(([codigo, nombre]) => (
                <label className="mb-1 flex items-center gap-2" key={codigo}>
                  <input
                    className={casilla}
                    type="checkbox"
                    checked={categorias.includes(codigo)}
                    onChange={() => alternarCategoria(codigo)}
                  />
                  {nombre}
                </label>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold">Rango de Precio</h3>
              <div className="mb-2">
                <label htmlFor="precio_min" className="mb-1 block text-sm">
                  Mínimo:
                </label>
                <input
                  type="number"
                  className={`${campoBase} h-8 w-full`}
                  id="precio_min"
                  min={0}
                  placeholder="$0"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="precio_max" className="mb-1 block text-sm">
                  Máximo:
                </label>
                <input
                  type="number"
                  className={`${campoBase} h-8 w-full`}
                  id="precio_max"
                  min={0}
                  placeholder="$1.000.000"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold">Marca</h3>
              {marcasDisponibles.length === 0 && <p className="text-sm text-gris">Sin marcas</p>}
              {marcasDisponibles.map((marca) => (
                <label className="mb-1 flex items-center gap-2" key={marca}>
                  <input
                    className={casilla}
                    type="checkbox"
                    checked={marcas.includes(marca)}
                    onChange={() => alternarMarca(marca)}
                  />
                  {marca}
                </label>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold">Disponibilidad</h3>
              <label className="flex items-center gap-2">
                <input
                  className={casilla}
                  type="checkbox"
                  checked={soloStock}
                  onChange={(e) => setSoloStock(e.target.checked)}
                />
                Solo con stock disponible
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-t border-gris/30 pt-4">
            <button type="button" className={boton('secundario', 'chico')} onClick={limpiar}>
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3 border-y border-gris/35 py-4">
        <p className="mb-0 font-semibold">
          {filtrados.length} {filtrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="ordenar" className="text-sm whitespace-nowrap">
            Ordenar por:
          </label>
          <select
            id="ordenar"
            className={`${campoBase} h-8 w-auto`}
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="recientes">Más recientes</option>
          </select>
        </div>
      </section>

      <section className="my-10">
        {cargando && <Cargando texto="Cargando catálogo..." />}
        <MensajeError mensaje={error} alReintentar={recargar} />
        {!cargando && !error && filtrados.length === 0 && (
          <p className="py-6 text-center text-gris">No hay productos que coincidan con la búsqueda.</p>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((producto) => (
            <ProductoCard key={producto.sku} producto={producto} alComprar={comprar} />
          ))}
        </div>
      </section>

      <ModalLoginRequerido visible={modalVisible} redireccion={redireccionLogin} alCerrar={cerrarModal} />
    </>
  )
}

export default CatalogoPage
