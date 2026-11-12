import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Check, X } from 'lucide-react'
import CampoTexto from '../../components/CampoTexto'
import MensajeError from '../../components/MensajeError'
import { anchoCompleto, botonDorado, enlace } from '../../utils/estilos'
import { campoDelMensaje, correoValido, passwordValida, requisitosPassword, rutValido } from '../../utils/validaciones'
import { useAuth } from '../../context/AuthContext'
import { mensajeDeError } from '../../api/apiClient'
import AuthService, { type RegistroPayload } from '../../services/auth.service'
import { destinoSeguro } from './LoginPage'

type Campo = keyof RegistroPayload
type Errores = Partial<Record<Campo, string>>

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

// Orden en que aparecen en pantalla: al enviar, el cursor va al primer campo con error
const ORDEN: Campo[] = ['rut', 'nombres', 'primerApellido', 'segundoApellido', 'username', 'correo', 'password', 'confirmarPassword']

// Revisa UN campo y devuelve el mensaje de error, o '' si está bien
const validarCampo = (campo: Campo, datos: RegistroPayload): string => {
  const valor = datos[campo].trim()
  switch (campo) {
    case 'rut':
      if (!valor) return 'Ingresa tu RUT.'
      return rutValido(valor) ? '' : 'El RUT no es válido. Revisa los números y el dígito verificador.'
    case 'nombres':
      return valor ? '' : 'Ingresa tus nombres.'
    case 'primerApellido':
      return valor ? '' : 'Ingresa tu primer apellido.'
    case 'segundoApellido':
      return valor ? '' : 'Ingresa tu segundo apellido.'
    case 'username':
      return valor ? '' : 'Elige un nombre de usuario.'
    case 'correo':
      if (!valor) return 'Ingresa tu correo electrónico.'
      return correoValido(valor) ? '' : 'El correo no tiene un formato válido (ejemplo: nombre@correo.cl).'
    case 'password':
      if (!datos.password) return 'Crea una contraseña.'
      return passwordValida(datos.password) ? '' : 'La contraseña no cumple los requisitos.'
    case 'confirmarPassword':
      if (!datos.confirmarPassword) return 'Repite tu contraseña.'
      return datos.confirmarPassword === datos.password ? '' : 'Las contraseñas no coinciden.'
  }
}

// Lista de requisitos de la contraseña que se marcan con ✓ mientras se escribe
const Requisito = ({ cumple, texto }: { cumple: boolean; texto: string }) => (
  <li className={`flex items-center gap-1 ${cumple ? 'text-green-700' : 'text-gris'}`}>
    {cumple ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
    {texto}
    <span className="sr-only">{cumple ? '(cumple)' : '(falta)'}</span>
  </li>
)

export const RegistroPage = () => {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const redireccion = destinoSeguro(parametros.get('redirect'))

  const [datos, setDatos] = useState<RegistroPayload>(FORMULARIO_VACIO)
  const [errores, setErrores] = useState<Errores>({})
  // Campos que el usuario ya visitó: solo esos muestran su error mientras escribe
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({})
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (evento: ChangeEvent<HTMLInputElement>) => {
    const campo = evento.target.name as Campo
    const nuevos = { ...datos, [campo]: evento.target.value }
    setDatos(nuevos)
    // Si el campo ya mostraba un error, se vuelve a revisar al escribir (así el rojo desaparece al corregirlo)
    if (tocados[campo]) {
      setErrores((previos) => ({
        ...previos,
        [campo]: validarCampo(campo, nuevos),
        // Si cambia la contraseña, la confirmación también puede dejar de coincidir
        ...(campo === 'password' && tocados.confirmarPassword
          ? { confirmarPassword: validarCampo('confirmarPassword', nuevos) }
          : {}),
      }))
    }
  }

  // Al salir de un campo se revisa y se muestra su error
  const salir = (evento: FocusEvent<HTMLInputElement>) => {
    const campo = evento.target.name as Campo
    setTocados((previos) => ({ ...previos, [campo]: true }))
    setErrores((previos) => ({ ...previos, [campo]: validarCampo(campo, datos) }))
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError(null)

    // 1. Se revisan todos los campos antes de llamar al backend
    const encontrados: Errores = {}
    for (const campo of ORDEN) {
      const mensaje = validarCampo(campo, datos)
      if (mensaje) encontrados[campo] = mensaje
    }
    setErrores(encontrados)
    setTocados(Object.fromEntries(ORDEN.map((c) => [c, true])))
    const primero = ORDEN.find((c) => encontrados[c])
    if (primero) {
      document.getElementById(primero)?.focus()
      return
    }

    // 2. Todo bien: se crea la cuenta y se inicia sesión
    setEnviando(true)
    try {
      await AuthService.registrar(datos)
      await iniciarSesion({ correo: datos.correo.trim(), password: datos.password })
      navigate(redireccion, { replace: true })
    } catch (err) {
      // 3. Si el backend rechaza algo (por ejemplo, RUT o correo ya registrado), se marca ese campo
      const mensaje = mensajeDeError(err, 'No se pudo crear la cuenta.')
      const campo = campoDelMensaje(mensaje) as Campo | null
      if (campo && campo in FORMULARIO_VACIO) {
        setErrores((previos) => ({ ...previos, [campo]: mensaje }))
        document.getElementById(campo)?.focus()
      } else {
        setError(mensaje)
      }
      setEnviando(false)
    }
  }

  const cantidadErrores = Object.values(errores).filter(Boolean).length
  const requisitos = requisitosPassword(datos.password)

  // Propiedades que comparten todos los campos
  const propiedades = (campo: Campo) => ({
    id: campo,
    name: campo,
    value: datos[campo],
    onChange: cambiar,
    onBlur: salir,
    error: errores[campo] || undefined,
  })

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <div className="rounded-lg bg-white p-6 shadow-sm md:p-12">
          {/* noValidate: los mensajes los muestra la página, no los globos del navegador */}
          <form onSubmit={enviar} noValidate>
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-2xl font-bold">Registro de usuario</h2>
              <p className="text-sm text-gris">Crea tu cuenta para comprar instrumentos y gestionar tus pedidos</p>
            </div>

            <MensajeError mensaje={error} />
            {cantidadErrores > 0 && (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="status">
                {cantidadErrores === 1
                  ? 'Hay 1 campo por corregir (marcado en rojo).'
                  : `Hay ${cantidadErrores} campos por corregir (marcados en rojo).`}
              </p>
            )}

            <CampoTexto
              {...propiedades('rut')}
              etiqueta="RUT"
              placeholder="12.345.678-9"
              ayuda="Puedes escribirlo con o sin puntos y guion."
            />
            <div className="grid gap-x-3 sm:grid-cols-2">
              <CampoTexto
                {...propiedades('nombres')}
                etiqueta="Nombres"
                className="mb-4 sm:col-span-2"
                placeholder="Ej. Juan Andrés"
                autoComplete="given-name"
              />
              <CampoTexto
                {...propiedades('primerApellido')}
                etiqueta="Primer apellido"
                className="mb-4"
                placeholder="Ej. Pérez"
              />
              <CampoTexto
                {...propiedades('segundoApellido')}
                etiqueta="Segundo apellido"
                className="mb-4"
                placeholder="Ej. Soto"
              />
            </div>
            <CampoTexto
              {...propiedades('username')}
              etiqueta="Nombre de usuario"
              placeholder="Ej. juanp"
              autoComplete="username"
            />
            <CampoTexto
              {...propiedades('correo')}
              etiqueta="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
            <CampoTexto
              {...propiedades('password')}
              etiqueta="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres, una letra y un número"
              autoComplete="new-password"
              ayuda={
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  <Requisito cumple={requisitos.largo} texto="8 caracteres o más" />
                  <Requisito cumple={requisitos.letra} texto="Una letra" />
                  <Requisito cumple={requisitos.numero} texto="Un número" />
                </ul>
              }
            />
            <CampoTexto
              {...propiedades('confirmarPassword')}
              etiqueta="Confirmar contraseña"
              type="password"
              className="mb-6"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
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
