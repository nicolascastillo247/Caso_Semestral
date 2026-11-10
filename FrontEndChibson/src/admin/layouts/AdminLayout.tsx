import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { ArrowRight, House, UserCircle } from 'lucide-react';

import { useAuth } from '../../tienda/context/AuthContext';

import { buttonVariants } from '../../components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet';

// Orden fijo del menú, igual al del HTML original. Nunca cambia según la página.
const LINKS = [
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
  { to: '/admin/ventas', texto: 'Ventas' },
  { to: '/admin/resenas', texto: 'Reseñas' },
  { to: '/admin/soporte', texto: 'Soporte' },
  { to: '/admin/noticias', texto: 'Noticias' },
  { to: '/admin/informes', texto: 'Informes' },
  { to: '/admin/historial', texto: 'Historial' },
];

// Corrección del profesor: el link de la página actual se destaca y queda deshabilitado
// (pointer-events-none impide hacerle clic). NavLink entrega isActive automáticamente.
const estiloLinkNavbar = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 pointer-events-none'
    : 'rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white';

const estiloLinkLateral = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'block border-l-4 border-zinc-900 bg-zinc-100 px-5 py-3 text-lg font-semibold pointer-events-none'
    : 'block border-l-4 border-transparent px-5 py-3 text-lg hover:bg-zinc-50';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { sesion, cerrarSesion } = useAuth();
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar superior */}
      <header className="bg-zinc-900 text-white shadow">
        <nav className="flex items-center gap-2 px-4 py-2">
          {/* "end": Dashboard solo está activo en /admin exacto, no en /admin/pedidos, etc. */}
          <NavLink
            to="/admin"
            end
            aria-label="Dashboard"
            className={({ isActive }) =>
              isActive
                ? 'rounded-md bg-white p-2 text-zinc-900 pointer-events-none'
                : 'rounded-md p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }
          >
            <House className="size-5" />
          </NavLink>

          {/* En pantallas angostas los links se desplazan hacia el lado en vez de cambiar de orden */}
          <ul className="flex flex-1 items-center gap-1 overflow-x-auto">
            {LINKS.map((link) => (
              <li key={link.to} className="shrink-0">
                <NavLink to={link.to} className={estiloLinkNavbar}>
                  {link.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Menú del perfil */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              aria-label="Menú del perfil"
            >
              <UserCircle className="size-6" />
              {/* Nombre del administrador que inició sesión */}
              {sesion && <span className="hidden text-sm sm:inline">{sesion.nombres}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
              <DropdownMenuItem disabled>Configuración</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/')}>Ir a la tienda</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  cerrarSesion();
                  navigate('/login');
                }}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </header>

      {/* Aquí se dibuja la página de la ruta actual */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Botón flotante y menú lateral (el "offcanvas" del HTML) */}
      <button
        type="button"
        title="Acción rápida"
        aria-label="Abrir menú lateral"
        onClick={() => setMenuLateralAbierto(true)}
        className={`${buttonVariants({ size: 'icon' })} fixed bottom-6 left-6 z-40 size-14 rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700`}
      >
        <ArrowRight className="size-6" />
      </button>

      <Sheet open={menuLateralAbierto} onOpenChange={setMenuLateralAbierto}>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-b p-5">
            <SheetTitle>Chibson · Administración</SheetTitle>
          </SheetHeader>
          <nav>
            <NavLink to="/admin" end className={estiloLinkLateral} onClick={() => setMenuLateralAbierto(false)}>
              Dashboard
            </NavLink>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={estiloLinkLateral}
                onClick={() => setMenuLateralAbierto(false)}
              >
                {link.texto}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
