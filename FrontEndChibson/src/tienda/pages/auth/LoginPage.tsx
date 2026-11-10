import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import CampoTexto from '../../components/CampoTexto'
import MensajeError from '../../components/MensajeError'
import { anchoCompleto, botonDorado, enlace } from '../../utils/estilos'
import { useAuth } from '../../context/AuthContext'
import { mensajeDeError } from '../../api/apiClient'

export const destinoSeguro = (redireccion: string | null): string =>
  redireccion && redireccion.startsWith('/') && !redireccion.startsWith('//') ? redireccion : '/'

export const LoginPage = () => {
  const { iniciarSesion, estaAutenticado } = useAuth()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const redireccion = destinoSeguro(parametros.get('redirect'))

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (estaAutenticado && !enviando) {
    return <Navigate to={redireccion} replace />
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const sesion = await iniciarSesion({ correo: correo.trim(), password })
      navigate(sesion.rol === 'CLIENTE' ? redireccion : '/admin', { replace: true })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo iniciar sesión.'))
      setEnviando(false)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-6 shadow-sm md:p-12">
          <form onSubmit={enviar}>
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-2xl font-bold">Inicio de sesión</h2>
              <p className="text-sm text-gris">Ingresa tus credenciales para acceder a tu cuenta</p>
            </div>

            <MensajeError mensaje={error} />

            <CampoTexto
              id="email"
              etiqueta="Correo electrónico"
              type="email"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <CampoTexto
              id="password"
              etiqueta="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="mb-6"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className={botonDorado + anchoCompleto} disabled={enviando}>
              {enviando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <hr className="my-6 border-0 border-t border-gris/35" />
          <div className="space-y-2 text-center text-sm">
            <p className="mb-2">
              ¿No tienes una cuenta?{' '}
              <Link to={`/registro?redirect=${encodeURIComponent(redireccion)}`} className={enlace}>
                Regístrate aquí
              </Link>
            </p>
            <p className="mb-0">
              <Link to="/recuperar-password" className={enlace}>
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
