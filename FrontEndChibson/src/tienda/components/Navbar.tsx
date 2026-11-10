import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { CircleUser, Menu, ShoppingCart } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

// Orden fijo del menú. Corrección del profesor: el link de la página actual se destaca
// y queda deshabilitado (pointer-events-none), en vez de cambiar de lugar.
const LINKS = [
  { to: '/', texto: 'Inicio', exacto: true },
  { to: '/catalogo', texto: 'Catálogo', exacto: false },
  { to: '/noticias', texto: 'Noticias', exacto: false },
  { to: '/nosotros', texto: 'Nosotros', exacto: false },
]

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 font-titulo font-medium transition-colors ${
    isActive ? 'pointer-events-none bg-dorado/10 text-dorado' : 'text-white hover:bg-dorado/10 hover:text-dorado'
  }`

const claseEnlaceLateral = ({ isActive }: { isActive: boolean }) =>
  `block border-l-4 px-5 py-3 text-lg ${
    isActive ? 'pointer-events-none border-dorado bg-crema font-semibold' : 'border-transparent hover:bg-fondo'
  }`

export const Navbar = () => {
  const { sesion, esCliente, cerrarSesion } = useAuth()
  const { cantidadTotal } = useCarrito()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const salir = () => {
    cerrarSesion()
    navigate('/')
  }

  return (
    <nav className="border-b-2 border-dorado bg-black px-4 py-1.5">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center">
          <img src="/img/chibson-navbar.png" alt="Chibson Instruments" className="h-14 w-auto mix-blend-screen sm:h-[68px]" />
        </Link>

        {/* Links en pantallas medianas y grandes */}
        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.exacto} className={claseEnlace}>
                {link.texto}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1">
          {esCliente && (
            <NavLink
              to="/carrito"
              aria-label="Carro de compras"
              className={({ isActive }) => `${claseEnlace({ isActive })} relative flex size-11 items-center justify-center`}
            >
              <ShoppingCart className="size-5" />
              {cantidadTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-amber-400 px-1 text-center text-xs font-bold text-tinta">
                  {cantidadTotal}
                </span>
              )}
            </NavLink>
          )}

          {/* Menú de la cuenta */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Cuenta"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-white hover:bg-dorado/10 hover:text-dorado"
            >
              <CircleUser className="size-5" />
              {sesion && <span className="hidden text-sm sm:inline">{sesion.nombres}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {!sesion && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/login')}>Iniciar sesión</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/registro')}>Registrarse</DropdownMenuItem>
                </>
              )}

              {sesion && esCliente && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>Mi perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mis-pedidos')}>Mis pedidos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/devoluciones')}>Devoluciones</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/soporte')}>Soporte</DropdownMenuItem>
                </>
              )}

              {sesion && !esCliente && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>Panel de administración</DropdownMenuItem>
              )}

              {sesion && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={salir}>Cerrar sesión</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botón del menú en celulares */}
          <button
            type="button"
            aria-label="Mostrar navegación"
            onClick={() => setMenuAbierto(true)}
            className="rounded-md border border-gris p-2 text-white sm:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetContent side="left" className="tienda p-0">
          <SheetHeader className="border-b p-5">
            <SheetTitle>Chibson Instruments</SheetTitle>
          </SheetHeader>
          <nav>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exacto}
                className={claseEnlaceLateral}
                onClick={() => setMenuAbierto(false)}
              >
                {link.texto}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

export default Navbar
