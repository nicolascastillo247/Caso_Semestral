import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '../admin/layouts/AdminLayout';
import { DashboardPage } from '../admin/DashboardPage';
import { PedidosPage } from '../admin/PedidosPage';
import { ProductosPage } from '../admin/ProductosPage';
import { UsuariosPage } from '../admin/UsuariosPage';
import { VentasPage } from '../admin/VentasPage';
import { ResenaPage } from '../admin/ResenaPage';
import { SoportePage } from '../admin/SoportePage';
import { NoticiasPage } from '../admin/NoticiasPage';
import { InformePage } from '../admin/InformePage';
import { HistorialPage } from '../admin/HistorialPage';

export const appRouter = createBrowserRouter([
  // Mientras no exista la parte del cliente, la raíz lleva al panel de administración
  { path: '/', element: <Navigate to="/admin" replace /> },

  {
    path: '/admin',
    element: <AdminLayout />,
    // Rutas hijas sin "/" inicial: React Router las une a /admin (por ejemplo /admin/pedidos)
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pedidos', element: <PedidosPage /> },
      { path: 'productos', element: <ProductosPage /> },
      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'ventas', element: <VentasPage /> },
      { path: 'resenas', element: <ResenaPage /> },
      { path: 'soporte', element: <SoportePage /> },
      { path: 'noticias', element: <NoticiasPage /> },
      { path: 'informes', element: <InformePage /> },
      { path: 'historial', element: <HistorialPage /> },
    ],
  },

  // Cualquier dirección que no exista vuelve al Dashboard
  { path: '*', element: <Navigate to="/admin" replace /> },
]);
