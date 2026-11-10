import { Link } from 'react-router'
import { enlace } from '../utils/estilos'

interface Paso {
  texto: string
  to?: string // sin "to" es la página actual
}

// Ruta de navegación ("migas de pan"): Catálogo / Guitarras / Les Paul
export const Migas = ({ pasos }: { pasos: Paso[] }) => (
  <nav aria-label="Ruta de navegación" className="mb-6">
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {pasos.map((paso, indice) => (
        <li key={indice} className="flex items-center gap-2">
          {indice > 0 && <span className="text-gris">/</span>}
          {paso.to ? (
            <Link to={paso.to} className={enlace}>
              {paso.texto}
            </Link>
          ) : (
            <span className="text-gris" aria-current="page">
              {paso.texto}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)

export default Migas
