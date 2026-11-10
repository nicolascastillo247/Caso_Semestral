import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { enlace } from '../utils/estilos'

export const TiendaLayout = () => {
  const { pathname } = useLocation()
  const { sesionExpirada, estaAutenticado } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    // "tienda" activa la fuente Poppins en los títulos (ver tienda.css)
    <div className="tienda flex min-h-screen flex-col bg-fondo leading-relaxed text-tinta">
      <Navbar />
      {sesionExpirada && !estaAutenticado && (
        <div className="border-b border-amber-200 bg-amber-50 p-3 text-center text-sm text-amber-900" role="alert">
          Tu sesión expiró.{' '}
          <Link to="/login" className={enlace}>
            Vuelve a iniciar sesión
          </Link>
          .
        </div>
      )}
      <main className="mx-auto my-12 w-full max-w-6xl flex-1 px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default TiendaLayout
