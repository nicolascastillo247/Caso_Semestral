import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { RUT_SESION } from '../../services/api';
import UsuarioService, { type EstadoUsuario, type RolUsuario, type Usuario } from '../../services/usuario.service';
import { estiloCampo, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

export const ROLES: RolUsuario[] = ['ADMINISTRADOR', 'CLIENTE'];

export const RolBadge = ({ rol }: { rol: RolUsuario }) => (
  <Badge variant={rol === 'ADMINISTRADOR' ? 'default' : 'secondary'}>{textoEnum(rol)}</Badge>
);

export const EstadoUsuarioBadge = ({ estado }: { estado: EstadoUsuario }) => (
  <Badge
    variant="outline"
    className={estado === 'ACTIVO' ? 'border-transparent bg-green-100 text-green-800' : 'border-transparent bg-zinc-200 text-zinc-700'}
  >
    {textoEnum(estado)}
  </Badge>
);

// Misma regla que el backend: mínimo 8 caracteres, con letras y números
const passwordValida = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

// ---------- Formulario ----------
// Se monta cada vez que se abre el modal, así empieza con los datos del usuario (o vacío al crear).

interface FormularioProps {
  usuario: Usuario | null;
  onCerrar: () => void;
  onTerminado: () => void;
}

const FormularioUsuario = ({ usuario, onCerrar, onTerminado }: FormularioProps) => {
  const editando = usuario !== null;
  const esMiCuenta = usuario?.rut === RUT_SESION;

  const [rut, setRut] = useState(usuario?.rut ?? '');
  const [nombres, setNombres] = useState(usuario?.nombres ?? '');
  const [primerApellido, setPrimerApellido] = useState(usuario?.primerApellido ?? '');
  const [segundoApellido, setSegundoApellido] = useState(usuario?.segundoApellido ?? '');
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [correo, setCorreo] = useState(usuario?.correo ?? '');
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '');
  const [rol, setRol] = useState<RolUsuario>(usuario?.rol ?? 'CLIENTE');
  const [password, setPassword] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async () => {
    const obligatorios = [nombres, primerApellido, segundoApellido, username, correo, telefono, ...(editando ? [] : [rut])];
    if (obligatorios.some((v) => v.trim() === '')) {
      setError('Completa todos los campos.');
      return;
    }
    if (!editando && !passwordValida(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, con letras y números.');
      return;
    }
    const datos = {
      nombres: nombres.trim(),
      primerApellido: primerApellido.trim(),
      segundoApellido: segundoApellido.trim(),
      username: username.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
    };
    setGuardando(true);
    setError('');
    try {
      if (editando) {
        // 1) Datos con el rol que ya tenía; 2) si el rol cambió, se asigna aparte (HU-70)
        await UsuarioService.actualizar(usuario.rut, { ...datos, rol: usuario.rol });
        if (rol !== usuario.rol) await UsuarioService.asignarRol(usuario.rut, rol);
      } else {
        await UsuarioService.crear({ ...datos, rut: rut.trim(), rol, password });
      }
      onTerminado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el usuario.'));
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!editando) return;
    setGuardando(true);
    setError('');
    try {
      await UsuarioService.eliminar(usuario.rut);
      onTerminado();
    } catch (err) {
      // Si tiene pedidos, el backend responde: "desactívelo en lugar de eliminarlo"
      setError(mensajeError(err, 'No se pudo eliminar el usuario.'));
      setConfirmando(false);
      setGuardando(false);
    }
  };

  const direccion = usuario && [usuario.condominio, usuario.numero, usuario.ciudadComuna, usuario.region]
    .filter((p) => p)
    .join(', ');

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editando ? 'Modificar usuario' : 'Agregar usuario'}</DialogTitle>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          {editando ? (
            <>RUT {usuario.rut} · <EstadoUsuarioBadge estado={usuario.estado} /></>
          ) : (
            'La cuenta queda activa y la persona puede iniciar sesión con su correo y contraseña.'
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {!editando && (
          <label className="flex flex-col gap-1 text-sm">
            RUT
            <Input value={rut} placeholder="12345678-5" onChange={(e) => setRut(e.target.value)} />
          </label>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Nombres
            <Input value={nombres} onChange={(e) => setNombres(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Primer apellido
            <Input value={primerApellido} onChange={(e) => setPrimerApellido(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Segundo apellido
            <Input value={segundoApellido} onChange={(e) => setSegundoApellido(e.target.value)} />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Nombre de usuario
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Rol
            <select
              className={estiloCampo}
              value={rol}
              disabled={esMiCuenta}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{textoEnum(r)}</option>
              ))}
            </select>
            {esMiCuenta && <span className="text-xs text-muted-foreground">No puedes cambiar tu propio rol.</span>}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Correo
            <Input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Teléfono
            <Input type="tel" value={telefono} placeholder="+56912345678" onChange={(e) => setTelefono(e.target.value)} />
          </label>
        </div>

        {!editando && (
          <label className="flex flex-col gap-1 text-sm">
            Contraseña inicial
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="text-xs text-muted-foreground">Mínimo 8 caracteres, con letras y números.</span>
          </label>
        )}

        {/* Dirección: solo lectura, la edita el cliente desde "Mi perfil" */}
        {editando && (
          <p className="rounded-md bg-muted p-2 text-sm">
            <strong>Dirección:</strong> {direccion || 'El usuario no ha registrado una dirección.'}
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Eliminar solo al editar, con confirmación en dos pasos. No se puede eliminar la propia cuenta. */}
        <div>
          {editando && !esMiCuenta && (confirmando ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar la cuenta?</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>
                Sí, eliminar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={guardando}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmando(true)} disabled={guardando}>
              <Trash2 /> Eliminar
            </Button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
          <Button onClick={() => void guardar()} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface UsuarioDialogProps {
  abierto: boolean;
  // null = agregar; con usuario = modificar
  usuario: Usuario | null;
  onCerrar: () => void;
  onTerminado: () => void;
}

export const UsuarioDialog = ({ abierto, usuario, onCerrar, onTerminado }: UsuarioDialogProps) => (
  <Dialog open={abierto} onOpenChange={(abrir: boolean) => { if (!abrir) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      {abierto && (
        <FormularioUsuario key={usuario?.rut ?? 'nuevo'} usuario={usuario} onCerrar={onCerrar} onTerminado={onTerminado} />
      )}
    </DialogContent>
  </Dialog>
);

export default UsuarioDialog;
