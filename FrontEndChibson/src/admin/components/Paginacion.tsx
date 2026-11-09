import { Button } from '../../components/ui/button';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  // Texto del contador, por ejemplo ['venta', 'ventas']
  nombre: [string, string];
  onCambiar: (pagina: number) => void;
}

// Paginación reutilizable para las tablas del administrador.
// La página actual queda destacada y deshabilitada, igual que el link activo del navbar.
export const Paginacion = ({ paginaActual, totalPaginas, totalRegistros, nombre, onCambiar }: PaginacionProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {totalRegistros} {totalRegistros === 1 ? nombre[0] : nombre[1]}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === 1}
          onClick={() => onCambiar(paginaActual - 1)}
        >
          Anterior
        </Button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
          <Button
            key={n}
            variant={n === paginaActual ? 'default' : 'outline'}
            size="sm"
            disabled={n === paginaActual}
            onClick={() => onCambiar(n)}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === totalPaginas}
          onClick={() => onCambiar(paginaActual + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default Paginacion;
