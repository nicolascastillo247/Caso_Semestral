import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Cargando from '../../components/Cargando'
import CampoTexto from '../../components/CampoTexto'
import MensajeError from '../../components/MensajeError'
import useApi from '../../hooks/useApi'
import { mensajeDeError } from '../../api/apiClient'
import AuthService from '../../services/auth.service'
import UsuarioService, { type PerfilPayload } from '../../services/usuario.service'
import { formatearFecha } from '../../utils/formato'
import { aviso, botonDorado, campo } from '../../utils/estilos'

type Aviso = { tipo: 'success' | 'danger'; texto: string } | null

const PERFIL_VACIO: PerfilPayload = {
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  username: '',
  telefono: '',
  region: '',
  ciudadComuna: '',
  condominio: '',
  numero: '',
}

export const MiPerfilPage = () => {
  const { datos: usuario, cargando, error, recargar } = useApi(() => UsuarioService.obtenerPerfil())
  const [perfil, setPerfil] = useState<PerfilPayload>(PERFIL_VACIO)
  const [avisoPerfil, setAvisoPerfil] = useState<Aviso>(null)
  const [guardando, setGuardando] = useState(false)

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [avisoPassword, setAvisoPassword] = useState<Aviso>(null)
  const [cambiando, setCambiando] = useState(false)

  useEffect(() => {
    if (usuario) {
      setPerfil({
        nombres: usuario.nombres ?? '',
        primerApellido: usuario.primerApellido ?? '',
        segundoApellido: usuario.segundoApellido ?? '',
        username: usuario.username ?? '',
        telefono: usuario.telefono ?? '',
        region: usuario.region ?? '',
        ciudadComuna: usuario.ciudadComuna ?? '',
        condominio: usuario.condominio ?? '',
        numero: usuario.numero ?? '',
      })
    }
  }, [usuario])

  if (cargando) return <Cargando texto="Cargando perfil..." />
  if (error || !usuario) return <MensajeError mensaje={error ?? 'No se pudo cargar el perfil.'} alReintentar={recargar} />

  const cambiar = (evento: ChangeEvent<HTMLInputElement>) =>
    setPerfil({ ...perfil, [evento.target.name]: evento.target.value })

  const guardarPerfil = async (evento: FormEvent) => {
    evento.preventDefault()
    setGuardando(true)
    setAvisoPerfil(null)
    try {
      await UsuarioService.actualizarPerfil(perfil)
      setAvisoPerfil({ tipo: 'success', texto: 'Tus datos se actualizaron correctamente.' })
    } catch (err) {
      setAvisoPerfil({ tipo: 'danger', texto: mensajeDeError(err, 'No se pudieron guardar los cambios.') })
    } finally {
      setGuardando(false)
    }
  }

  const guardarPassword = async (evento: FormEvent) => {
    evento.preventDefault()
    if (nuevaPassword !== confirmarPassword) {
      setAvisoPassword({ tipo: 'danger', texto: 'Las contraseñas no coinciden.' })
      return
    }
    setCambiando(true)
    setAvisoPassword(null)
    try {
      const mensaje = await AuthService.cambiarPassword({ nuevaPassword, confirmarPassword })
      setAvisoPassword({ tipo: 'success', texto: mensaje })
      setNuevaPassword('')
      setConfirmarPassword('')
    } catch (err) {
      setAvisoPassword({ tipo: 'danger', texto: mensajeDeError(err, 'No se pudo cambiar la contraseña.') })
    } finally {
      setCambiando(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Mi perfil</h1>
      <p className="text-gris mb-6">Actualiza tus datos personales y tu dirección de despacho.</p>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <form className="rounded-lg bg-white shadow-sm p-6" onSubmit={guardarPerfil}>
            {avisoPerfil && <div className={aviso[avisoPerfil.tipo === 'success' ? 'exito' : 'error']}>{avisoPerfil.texto}</div>}

            <h2 className="text-lg font-bold">Datos personales</h2>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="mb-1 block text-sm font-semibold" htmlFor="rut">
                  RUT
                </label>
                <input id="rut" className={campo} value={usuario.rut} readOnly disabled />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="mb-1 block text-sm font-semibold" htmlFor="correo">
                  Correo
                </label>
                <input id="correo" className={campo} value={usuario.correo} readOnly disabled />
              </div>
              <CampoTexto className="col-span-12 md:col-span-6" id="nombres" name="nombres" etiqueta="Nombres" required value={perfil.nombres} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="username" name="username" etiqueta="Nombre de usuario" required value={perfil.username} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="primerApellido" name="primerApellido" etiqueta="Primer apellido" required value={perfil.primerApellido} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="segundoApellido" name="segundoApellido" etiqueta="Segundo apellido" required value={perfil.segundoApellido} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="telefono" name="telefono" etiqueta="Teléfono" placeholder="+56 9 1234 5678" value={perfil.telefono} onChange={cambiar} />
            </div>

            <h2 className="text-lg font-bold mt-2">Mi dirección</h2>
            <div className="grid grid-cols-12 gap-4">
              <CampoTexto className="col-span-12 md:col-span-6" id="region" name="region" etiqueta="Región" required value={perfil.region} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="ciudadComuna" name="ciudadComuna" etiqueta="Ciudad o comuna" required value={perfil.ciudadComuna} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="numero" name="numero" etiqueta="Calle y número" required value={perfil.numero} onChange={cambiar} />
              <CampoTexto className="col-span-12 md:col-span-6" id="condominio" name="condominio" etiqueta="Depto. o condominio (opcional)" value={perfil.condominio} onChange={cambiar} />
            </div>

            <button type="submit" className={`${botonDorado} mt-6 self-start`} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Actualizar datos'}
            </button>
          </form>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <form className="rounded-lg bg-white shadow-sm p-6 mb-6" onSubmit={guardarPassword}>
            <h2 className="text-lg font-bold">Cambiar contraseña</h2>
            {avisoPassword && <div className={aviso[avisoPassword.tipo === 'success' ? 'exito' : 'error']}>{avisoPassword.texto}</div>}
            <CampoTexto
              id="nuevaPassword"
              etiqueta="Nueva contraseña"
              type="password"
              minLength={8}
              ayuda="Mínimo 8 caracteres, una letra y un número."
              autoComplete="new-password"
              required
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
            <CampoTexto
              id="confirmarPasswordPerfil"
              etiqueta="Confirmar contraseña"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
            />
            <button type="submit" className={`${botonDorado} self-start`} disabled={cambiando}>
              {cambiando ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>

          <div className="rounded-lg bg-crema p-6">
            <h2 className="text-base font-bold">Mi cuenta</h2>
            <p className="text-sm mb-1">
              <strong>Tipo de cuenta:</strong> {usuario.rol}
            </p>
            <p className="text-sm mb-0">
              <strong>Cliente desde:</strong> {formatearFecha(usuario.fechaRegistro)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default MiPerfilPage
