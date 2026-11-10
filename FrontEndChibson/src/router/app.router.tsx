import { createBrowserRouter } from 'react-router';

// ---------- Panel de administración ----------
import { AdminLayout } from '../admin/layouts/AdminLayout';
import { RutaAdmin } from '../admin/components/RutaAdmin';
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

// ---------- Tienda (parte del cliente) ----------
import TiendaLayout from '../tienda/layouts/TiendaLayout';
import RutaCliente from '../tienda/components/RutaCliente';
import InicioPage from '../tienda/pages/tienda/InicioPage';
import CatalogoPage from '../tienda/pages/tienda/CatalogoPage';
import ProductoDetallePage from '../tienda/pages/tienda/ProductoDetallePage';
// Se renombra porque el panel también tiene una página NoticiasPage
import NoticiasTiendaPage from '../tienda/pages/tienda/NoticiasPage';
import NoticiaDetallePage from '../tienda/pages/tienda/NoticiaDetallePage';
import NosotrosPage from '../tienda/pages/tienda/NosotrosPage';
import NoEncontradoPage from '../tienda/pages/tienda/NoEncontradoPage';
import LoginPage from '../tienda/pages/auth/LoginPage';
import RegistroPage from '../tienda/pages/auth/RegistroPage';
import RecuperarPasswordPage from '../tienda/pages/auth/RecuperarPasswordPage';
import CarritoPage from '../tienda/pages/cliente/CarritoPage';
import CheckoutPage from '../tienda/pages/cliente/CheckoutPage';
import ConfirmacionPedidoPage from '../tienda/pages/cliente/ConfirmacionPedidoPage';
import MisPedidosPage from '../tienda/pages/cliente/MisPedidosPage';
import PedidoDetallePage from '../tienda/pages/cliente/PedidoDetallePage';
import SolicitarDevolucionPage from '../tienda/pages/cliente/SolicitarDevolucionPage';
import MisDevolucionesPage from '../tienda/pages/cliente/MisDevolucionesPage';
import MisTicketsPage from '../tienda/pages/cliente/MisTicketsPage';
import NuevoTicketPage from '../tienda/pages/cliente/NuevoTicketPage';
import TicketDetallePage from '../tienda/pages/cliente/TicketDetallePage';
import MiPerfilPage from '../tienda/pages/cliente/MiPerfilPage';
import DejarResenaPage from '../tienda/pages/cliente/DejarResenaPage';

export const appRouter = createBrowserRouter([
  // Tienda: navbar + página + footer
  {
    path: '/',
    element: <TiendaLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'productos/:sku', element: <ProductoDetallePage /> },
      { path: 'noticias', element: <NoticiasTiendaPage /> },
      { path: 'noticias/:id', element: <NoticiaDetallePage /> },
      { path: 'nosotros', element: <NosotrosPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegistroPage /> },
      { path: 'recuperar-password', element: <RecuperarPasswordPage /> },
      {
        // Solo clientes con sesión iniciada
        element: <RutaCliente />,
        children: [
          { path: 'carrito', element: <CarritoPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'pedido-confirmado/:numero', element: <ConfirmacionPedidoPage /> },
          { path: 'mis-pedidos', element: <MisPedidosPage /> },
          { path: 'mis-pedidos/:numero', element: <PedidoDetallePage /> },
          { path: 'mis-pedidos/:numero/devolucion', element: <SolicitarDevolucionPage /> },
          { path: 'devoluciones', element: <MisDevolucionesPage /> },
          { path: 'soporte', element: <MisTicketsPage /> },
          { path: 'soporte/nuevo', element: <NuevoTicketPage /> },
          { path: 'soporte/:numero', element: <TicketDetallePage /> },
          { path: 'perfil', element: <MiPerfilPage /> },
          { path: 'productos/:sku/resena', element: <DejarResenaPage /> },
        ],
      },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },

  // Panel de administración: solo administradores con sesión iniciada
  {
    element: <RutaAdmin />,
    children: [
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
    ],
  },
]);
