import { Link } from 'react-router'
import { botonDorado } from '../../utils/estilos'

export const NoEncontradoPage = () => (
  <div className="py-12 text-center">
    <h1 className="mb-2 text-4xl font-bold">Página no encontrada</h1>
    <p className="mb-6 text-gris">La dirección que buscas no existe.</p>
    <Link to="/" className={botonDorado}>
      Volver al inicio
    </Link>
  </div>
)

export default NoEncontradoPage
