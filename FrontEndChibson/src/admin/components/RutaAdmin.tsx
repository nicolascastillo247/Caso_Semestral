import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../tienda/context/AuthContext';

// Protege todo /admin: sin sesión manda al login, y un cliente vuelve a la tienda
export const RutaAdmin = () => {
  const { sesion } = useAuth();
  const location = useLocation();

  if (!sesion) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (sesion.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default RutaAdmin;
