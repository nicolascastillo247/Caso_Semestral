import { CONTACTO_POR_DEFECTO } from '../../components/ContactoSection'
import useApi from '../../hooks/useApi'
import InstitucionalService from '../../services/institucional.service'
import { divisor, tarjetaCrema } from '../../utils/estilos'

const MISION_POR_DEFECTO =
  'Brindar a los músicos las mejores herramientas sonoras del mercado, combinando calidad técnica, precios accesibles y un servicio al cliente comprometido con el crecimiento artístico de nuestra comunidad.'

const VISION_POR_DEFECTO =
  'Ser la tienda referente de instrumentos y equipamiento musical a nivel nacional, reconocida por la excelencia de nuestros productos, la cercanía con nuestros clientes y el fomento activo de la cultura musical.'

export const NosotrosPage = () => {
  const { datos } = useApi(() => InstitucionalService.obtener())

  return (
    <>
      <section className="grid items-center gap-6 lg:grid-cols-12">
        <div className="text-center lg:col-span-5">
          <img src="/img/logo.png" alt="Chibson Instruments" className="mx-auto max-h-64 max-w-full" />
        </div>
        <div className="lg:col-span-7">
          <h2 className="mb-3 text-3xl font-bold">Quiénes Somos</h2>
          <p className="text-lg">
            En <strong>Chibson Instruments</strong> nos dedicamos a acercar la música a cada rincón, ofreciendo
            instrumentos musicales de alta calidad y accesorios especializados tanto para músicos emergentes como para
            profesionales consolidados.
          </p>
        </div>
      </section>

      <hr className={divisor} />

      <section className="grid gap-6 md:grid-cols-2">
        <article className={`${tarjetaCrema} h-full`}>
          <h3 className="mb-2 text-xl font-bold">Nuestra Misión</h3>
          <p className="mb-0">{datos?.mision || MISION_POR_DEFECTO}</p>
        </article>
        <article className={`${tarjetaCrema} h-full`}>
          <h3 className="mb-2 text-xl font-bold">Nuestra Visión</h3>
          <p className="mb-0">{datos?.vision || VISION_POR_DEFECTO}</p>
        </article>
      </section>

      <hr className={divisor} />

      <section className="rounded-lg border-l-4 border-dorado bg-crema p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-bold">Información de Contacto</h2>
        <ul className="flex flex-col gap-2">
          <li>
            <strong>Correo electrónico:</strong> {datos?.correo || CONTACTO_POR_DEFECTO.correo}
          </li>
          <li>
            <strong>Teléfono / WhatsApp:</strong> {datos?.telefono || CONTACTO_POR_DEFECTO.telefono}
          </li>
          <li>
            <strong>Ubicación:</strong> {datos?.direccion || CONTACTO_POR_DEFECTO.direccion}
          </li>
          <li>
            <strong>Horario de atención:</strong> Lunes a Viernes de 10:00 a 19:00 hrs / Sábados de 10:00 a 14:00 hrs
          </li>
        </ul>
      </section>
    </>
  )
}

export default NosotrosPage
