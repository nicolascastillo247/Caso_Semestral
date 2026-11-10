import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import CampoTexto from '../../components/CampoTexto'
import MensajeError from '../../components/MensajeError'
import { anchoCompleto, aviso, botonDorado, enlace } from '../../utils/estilos'
import { mensajeDeError } from '../../api/apiClient'
import AuthService, { type RecuperarPayload } from '../../services/auth.service'

export const RecuperarPasswordPage = () => {
  const [datos, setDatos] = useState<RecuperarPayload>({
    rut: '',
    correo: '',
    nuevaPassword: '',
    confirmarPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (evento: ChangeEvent<HTMLInputElement>) =>
    setDatos({ ...datos, [evento.target.name]: evento.target.value })

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (datos.nuevaPassword !== datos.confirmarPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      setExito(await AuthService.recuperarPassword(datos))
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo recuperar la contraseña.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-6 shadow-sm md:p-12">
          <div className="mb-6 text-center">
            <h2 className="mb-1 text-2xl font-bold">Recuperar contraseña</h2>
            <p className="text-sm text-gris">
              Ingresa el RUT y el correo de tu cuenta, y elige una contraseña nueva.
            </p>
          </div>

          {exito ? (
            <div className={`${aviso.exito} text-center`}>
              <p className="mb-3">{exito}</p>
              <Link to="/login" className={botonDorado}>
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={enviar}>
              <MensajeError mensaje={error} />
              <CampoTexto id="rut" name="rut" etiqueta="RUT" required value={datos.rut} onChange={cambiar} />
              <CampoTexto
                id="correo"
                name="correo"
                etiqueta="Correo electrónico"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={datos.correo}
                onChange={cambiar}
              />
              <CampoTexto
                id="nuevaPassword"
                name="nuevaPassword"
                etiqueta="Nueva contraseña"
                type="password"
                minLength={8}
                required
                value={datos.nuevaPassword}
                onChange={cambiar}
              />
              <CampoTexto
                id="confirmarPassword"
                name="confirmarPassword"
                etiqueta="Confirmar contraseña"
                type="password"
                minLength={8}
                className="mb-6"
                required
                value={datos.confirmarPassword}
                onChange={cambiar}
              />
              <button type="submit" className={botonDorado + anchoCompleto} disabled={enviando}>
                {enviando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}

          <hr className="my-6 border-0 border-t border-gris/35" />
          <div className="space-y-2 text-center text-sm">
            <p className="mb-2">
              <Link to="/login" className={enlace}>
                ← Volver a Iniciar Sesión
              </Link>
            </p>
            <p className="mb-0">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className={enlace}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecuperarPasswordPage
