import { useState } from 'react';
import { ChevronDown, Filter, History, Pencil, RefreshCw, Search, UserPlus } from 'lucide-react';

import useUsuarios from '../hooks/useUsuarios';
import { rutSesion } from '../services/api';
import UsuarioService, { type EstadoUsuario, type RolUsuario, type Usuario } from '../services/usuario.service';
import { estiloCampo, fechaDeHoy, textoEnum } from '../utils/formato';
import { mensajeError } from '../utils/errores';

import { Paginacion } from './components/Paginacion';
import { EstadoUsuarioBadge, ROLES, RolBadge, UsuarioDialog } from './components/UsuarioDialog';
import { HistorialUsuarioDialog } from './components/HistorialUsuarioDialog';

import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FILAS_POR_PAGINA = 10;
const ESTADOS: EstadoUsuario[] = ['ACTIVO', 'DESACTIVADO'];

// "2026-11-08" → "08-11-2026" (sin new Date, que lo tomaría como UTC y mostraría el día anterior)
const fechaDia = (fecha: string) => fecha.split('-').reverse().join('-');
const nombreCompleto = (u: Usuario) => `${u.nombres} ${u.primerApellido} ${u.segundoApellido}`;

export const UsuariosPage = () => {
  // 1. Datos del backend
  const { usuarios, loading, error, recargar } = useUsuarios();

  // 2. Filtros, página y modales
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<EstadoUsuario | ''>('');
  const [rol, setRol] = useState<RolUsuario | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [historialDe, setHistorialDe] = useState<Usuario | null>(null);
  const [cambiandoRut, setCambiandoRut] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState('');

  // 3. Buscador y filtros (las fechas filtran por fecha de registro)
  const busqueda = texto.trim().toLowerCase();
  const filtrados = usuarios.filter((u) => {
    const dia = u.fechaRegistro ?? '';
    const coincideTexto =
      busqueda === '' ||
      u.rut.toLowerCase().includes(busqueda) ||
      nombreCompleto(u).toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda) ||
      u.correo.toLowerCase().includes(busqueda);
    return (
      coincideTexto &&
      (estado === '' || u.estado === estado) &&
      (rol === '' || u.rol === rol) &&
      (desde === '' || (dia !== '' && dia >= desde)) &&
      (hasta === '' || (dia !== '' && dia <= hasta))
    );
  });

  // 4. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // El estado se elige con los botones rápidos, no en el desplegable
  const filtrosActivos = [rol, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || estado !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setRol('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const cuantos = (e: EstadoUsuario) => usuarios.filter((u) => u.estado === e).length;

  // 5. Modal: null = agregar, con usuario = modificar
  const abrirModal = (usuario: Usuario | null) => {
    setEditando(usuario);
    setModalAbierto(true);
  };
  const alTerminar = () => {
    setModalAbierto(false);
    void recargar();
  };

  // 6. Desactivar / reactivar desde la tabla. No borra nada, así que no pide confirmación.
  const cambiarEstado = async (u: Usuario) => {
    setCambiandoRut(u.rut);
    setErrorEstado('');
    try {
      if (u.estado === 'ACTIVO') await UsuarioService.desactivar(u.rut);
      else await UsuarioService.reactivar(u.rut);
      await recargar();
    } catch (err) {
      setErrorEstado(mensajeError(err, 'No se pudo cambiar el estado del usuario.'));
    } finally {
      setCambiandoRut(null);
    }
  };

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Cuentas de clientes y administradores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button onClick={() => abrirModal(null)}>
            <UserPlus /> Agregar usuario
          </Button>
        </div>
      </div>

      {/* Botones rápidos por estado: el activo queda destacado y deshabilitado */}
      <div className="flex flex-wrap gap-2">
        {(['', ...ESTADOS] as (EstadoUsuario | '')[]).map((e) => (
          <Button
            key={e || 'TODOS'}
            size="sm"
            variant={estado === e ? 'default' : 'outline'}
            disabled={estado === e}
            onClick={() => {
              setEstado(e);
              setPagina(1);
            }}
          >
            {e === '' ? `Todos (${usuarios.length})` : `${textoEnum(e)}s (${cuantos(e)})`}
          </Button>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, RUT, usuario o correo..."
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setPagina(1);
            }}
          />
        </div>

        <Popover>
          <PopoverTrigger className={buttonVariants({ variant: 'default' })}>
            <Filter />
            Filtros
            {filtrosActivos > 0 && (
              <span className="ml-1 rounded-full bg-background px-1.5 text-xs text-foreground">{filtrosActivos}</span>
            )}
            <ChevronDown />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              Rol
              <select
                className={estiloCampo}
                value={rol}
                onChange={(e) => {
                  setRol(e.target.value as RolUsuario | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{textoEnum(r)}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Registrado desde
              <input
                type="date"
                className={estiloCampo}
                value={desde}
                max={hasta || undefined}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPagina(1);
                }}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Registrado hasta
              <input
                type="date"
                className={estiloCampo}
                value={hasta}
                min={desde || undefined}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPagina(1);
                }}
              />
            </label>

            <Button variant="outline" className="w-full" onClick={limpiarFiltros} disabled={filtrosActivos === 0}>
              Limpiar filtros
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <p className="text-red-600">No se pudieron cargar los usuarios. Revisa que el gateway y ms-usuarios estén encendidos.</p>
      )}
      {errorEstado && <p className="text-red-600">{errorEstado}</p>}

      {/* Tabla: eliminar está dentro del modal de modificar */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RUT</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ningún usuario coincide con los filtros.' : 'No hay usuarios registrados.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((u) => {
            const esMiCuenta = u.rut === rutSesion();
            return (
              <TableRow key={u.rut}>
                <TableCell>{u.rut}</TableCell>
                <TableCell className="font-medium">
                  {nombreCompleto(u)}
                  {esMiCuenta && <span className="ml-2 text-xs text-muted-foreground">(tú)</span>}
                </TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell><RolBadge rol={u.rol} /></TableCell>
                <TableCell>{u.fechaRegistro ? fechaDia(u.fechaRegistro) : '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EstadoUsuarioBadge estado={u.estado} />
                    {/* Nadie puede desactivar su propia cuenta */}
                    {!esMiCuenta && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cambiandoRut === u.rut}
                        onClick={() => void cambiarEstado(u)}
                      >
                        {cambiandoRut === u.rut ? '...' : u.estado === 'ACTIVO' ? 'Desactivar' : 'Reactivar'}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {u.rol === 'ADMINISTRADOR' && (
                      <Button
                        variant="outline"
                        size="icon"
                        title="Historial del usuario"
                        aria-label={`Historial de ${u.username}`}
                        onClick={() => setHistorialDe(u)}
                      >
                        <History />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      title="Modificar"
                      aria-label={`Modificar ${u.username}`}
                      onClick={() => abrirModal(u)}
                    >
                      <Pencil />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={filtrados.length}
        nombre={['usuario', 'usuarios']}
        onCambiar={setPagina}
      />

      <UsuarioDialog abierto={modalAbierto} usuario={editando} onCerrar={() => setModalAbierto(false)} onTerminado={alTerminar} />
      <HistorialUsuarioDialog usuario={historialDe} onCerrar={() => setHistorialDe(null)} />
    </section>
  );
};

export default UsuariosPage;
