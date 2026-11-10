import { RouterProvider } from 'react-router';
import { AuthProvider } from './tienda/context/AuthContext';
import { CarritoProvider } from './tienda/context/CarritoContext';
import { appRouter } from './router/app.router';

// La sesión (AuthProvider) y el carro (CarritoProvider) envuelven a toda la aplicación:
// así la tienda y el panel de administración comparten el mismo login.
export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <RouterProvider router={appRouter} />
      </CarritoProvider>
    </AuthProvider>
  );
}
