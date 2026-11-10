import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import CampoTexto from '../../components/CampoTexto'
import MensajeError from '../../components/MensajeError'
import { anchoCompleto, botonDorado, enlace } from '../../utils/estilos'
import { useAuth } from '../../context/AuthContext'
import { mensajeDeError } from '../../api/apiClient'
import AuthService, { type RegistroPayload } from '../../services/auth.service'
import { destinoSeguro } from './LoginPage'

const FORMULARIO_VACIO: RegistroPayload = {
  rut: '',
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  username: '',
  correo: '',
  password: '',
  confirmarPassword: '',
}

export const RegistroPage = () => {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const redireccion = destinoSeguro(parametros.get('redirect'))

  const [datos, setDatos] = useState<RegistroPayload>(FORMULARIO_VACIO)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (evento: ChangeEvent<HTMLInputElement>) =>
    setDatos({ ...datos, [evento.target.name]: evento.target.value })

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (datos.password !== datos.confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      await AuthService.registrar(datos)
      await iniciarSesion({ correo: datos.correo.trim(), password: datos.password })
      navigate(redireccion, { replace: true })
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear la cuenta.'))
      setEnviando(false)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <div className="rounded-lg bg-white p-6 shadow-sm md:p-12">
          <form onSubmit={enviar}>
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-2xl font-bold">Registro de usuario</h2>
              <p className="text-sm text-gris">Crea tu cuenta para comprar instrumentos y gestionar tus pedidos</p>
            </div>

            <MensajeError mensaje={error} />

            <CampoTexto
              id="rut"
              name="rut"
              etiqueta="RUT"
              placeholder="12.345.678-9"
              ayuda="Puedes escribirlo con o sin puntos y guion."
              required
              value={datos.rut}
              onChange={cambiar}
            />
            <div className="grid gap-x-3 sm:grid-cols-2">
              <CampoTexto
                id="nombres"
                name="nombres"
                etiqueta="Nombres"
                className="mb-4 sm:col-span-2"
                placeholder="Ej. Juan Andrés"
                required
                value={datos.nombres}
                onChange={cambiar}
              />
              <CampoTexto
                id="primerApellido"
                name="primerApellido"
                etiqueta="Primer apellido"
                className="mb-4"
                placeholder="Ej. Pérez"
                required
                value={datos.primerApellido}
                onChange={cambiar}
              />
              <CampoTexto
                id="segundoApellido"
                name="segundoApellido"
                etiqueta="Segundo apellido"
                className="mb-4"
                placeholder="Ej. Soto"
                required
                value={datos.segundoApellido}
                onChange={cambiar}
              />
            </div>
            <CampoTexto
              id="username"
              name="username"
              etiqueta="Nombre de usuario"
              placeholder="Ej. juanp"
              required
              value={datos.username}
              onChange={cambiar}
            />
            <CampoTexto
              id="correo"
              name="correo"
              etiqueta="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
              value={datos.correo}
              onChange={cambiar}
            />
            <CampoTexto
              id="password"
              name="password"
              etiqueta="Contraseña"
              type="password"
              minLength={8}
              placeholder="Mínimo 8 caracteres, una letra y un número"
              autoComplete="new-password"
              required
              value={datos.password}
              onChange={cambiar}
            />
            <CampoTexto
              id="confirmarPassword"
              name="confirmarPassword"
              etiqueta="Confirmar contraseña"
              type="password"
              minLength={8}
              className="mb-6"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              required
              value={datos.confirmarPassword}
              onChange={cambiar}
            />

            <button type="submit" className={botonDorado + anchoCompleto} disabled={enviando}>
              {enviando ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <hr className="my-6 border-0 border-t border-gris/35" />
          <div className="space-y-2 text-center text-sm">
            <p className="mb-0">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className={enlace}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistroPage
