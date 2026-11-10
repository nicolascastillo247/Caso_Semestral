import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

export const RutaCliente = () => {
  const { estaAutenticado, esCliente } = useAuth()
  const location = useLocation()

  if (!estaAutenticado) {
    const destino = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(destino)}`} replace />
  }
  if (!esCliente) {
    return <Navigate to="/admin" replace />
  }
  return <Outlet />
}

export default RutaCliente
