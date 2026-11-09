import useAccionesAdministrador from '../../hooks/useAccionesAdministrador';
import type { TipoAccion } from '../../services/accion.service';
import type { Usuario } from '../../services/usuario.service';
import { fechaHora, textoEnum } from '../../utils/formato';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

// Mismos colores que en la página de Historial
const colorTipo = (tipo: TipoAccion) => {
  if (tipo === 'ELIMINAR') return 'destructive';
  if (tipo === 'CREAR') return 'default';
  if (tipo === 'MODIFICAR') return 'secondary';
  return 'outline';
};

interface HistorialUsuarioDialogProps {
  // Administrador cuyo historial se muestra; null = modal cerrado
  usuario: Usuario | null;
  onCerrar: () => void;
}

// "Historial del usuario": las acciones que hizo un administrador en el panel
export const HistorialUsuarioDialog = ({ usuario, onCerrar }: HistorialUsuarioDialogProps) => {
  const { acciones, loading, error } = useAccionesAdministrador(usuario?.rut ?? null);

  return (
    <Dialog open={usuario !== null} onOpenChange={(abierto: boolean) => { if (!abierto) onCerrar(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial del usuario</DialogTitle>
          <DialogDescription>
            {usuario && `${usuario.nombres} ${usuario.primerApellido} (${usuario.rut}) — acciones en el panel de administración`}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Cargando historial...</p>}
        {error && <p className="text-sm text-red-600">No se pudo cargar el historial.</p>}

        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    Este administrador todavía no registra acciones.
                  </TableCell>
                </TableRow>
              )}
              {acciones.map((a) => (
                <TableRow key={a.idRegistro}>
                  <TableCell>{a.idRegistro}</TableCell>
                  <TableCell><Badge variant={colorTipo(a.tipo)}>{textoEnum(a.tipo)}</Badge></TableCell>
                  <TableCell>{a.modulo}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{a.descripcion}</TableCell>
                  <TableCell>{fechaHora(a.fecha)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCerrar}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistorialUsuarioDialog;
