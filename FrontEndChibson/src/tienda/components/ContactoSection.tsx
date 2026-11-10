import InstitucionalService from '../services/institucional.service'
import useApi from '../hooks/useApi'

export const CONTACTO_POR_DEFECTO = {
  correo: 'contacto@chibsoninstruments.com',
  telefono: '+56 9 1234 5678',
  direccion: 'Av. Principal 1234, Concepción, Chile',
}

export const ContactoSection = () => {
  const { datos } = useApi(() => InstitucionalService.obtener())

  return (
    <section className="rounded-lg border-l-4 border-dorado bg-crema p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-bold">Información de Contacto</h2>
      <p className="mb-3">
        ¿Tienes dudas o buscas asesoría personalizada sobre un instrumento? Contáctanos a través de nuestros canales
        oficiales:
      </p>
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
  )
}

export default ContactoSection
