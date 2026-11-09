import { useState } from 'react';
import { ChevronDown, Eye, Filter, RefreshCw, Search } from 'lucide-react';

import useVentas from '../hooks/useVentas';
import type { MetodoPago, Venta } from '../services/venta.service';
import { estiloCampo, fechaDeHoy, fechaHora, pesos, soloFecha, textoEnum } from '../utils/formato';
import { Paginacion } from './components/Paginacion';

import { Button, buttonVariants } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog';

const FILAS_POR_PAGINA = 10;
const METODOS: MetodoPago[] = ['DEBITO', 'CREDITO', 'TRANSFERENCIA'];

// Si el backend no pudo traer el nombre del cliente, se muestra su RUT
const nombreCliente = (venta: Venta) => venta.nombreCliente ?? venta.rutCliente;

export const VentasPage = () => {
  // 1. Datos del backend
  const { ventas, loading, error, recargar } = useVentas();

  // 2. Buscador, filtros y página actual
  const [texto, setTexto] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago | ''>('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);

  // 3. Aplicar buscador y filtros
  const busqueda = texto.trim().toLowerCase();
  const filtradas = ventas.filter((v) => {
    const dia = v.fecha.slice(0, 10); // "2026-11-07", mismo formato que <input type="date">
    const coincideTexto =
      busqueda === '' ||
      nombreCliente(v).toLowerCase().includes(busqueda) ||
      v.rutCliente.includes(busqueda) ||
      String(v.numeroVenta).includes(busqueda);
    const coincideMetodo = metodo === '' || v.metodoPago === metodo;
    const coincideDesde = desde === '' || dia >= desde;
    const coincideHasta = hasta === '' || dia <= hasta;
    return coincideTexto && coincideMetodo && coincideDesde && coincideHasta;
  });

  // 4. Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * FILAS_POR_PAGINA, paginaActual * FILAS_POR_PAGINA);

  // Suma neta de las ventas filtradas (lo que realmente quedó después de los reembolsos)
  const totalFiltrado = filtradas.reduce((suma, v) => suma + v.totalNeto, 0);

  const filtrosActivos = [metodo, desde, hasta].filter((f) => f !== '').length;
  const hayFiltros = texto !== '' || filtrosActivos > 0;
  const limpiarFiltros = () => {
    setMetodo('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — Registro de ventas</p>
        </div>
        <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Buscador y botón de filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por cliente, RUT o número de venta..."
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
              <span className="ml-1 rounded-full bg-background px-1.5 text-xs text-foreground">
                {filtrosActivos}
              </span>
            )}
            <ChevronDown />
          </PopoverTrigger>

          <PopoverContent align="end" className="w-72 space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              Método de pago
              <select
                className={estiloCampo}
                value={metodo}
                onChange={(e) => {
                  setMetodo(e.target.value as MetodoPago | '');
                  setPagina(1);
                }}
              >
                <option value="">Todos los métodos</option>
                {METODOS.map((m) => (
                  <option key={m} value={m}>{textoEnum(m)}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              Fecha desde
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
              Fecha hasta
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
        <p className="text-red-600">
          No se pudieron cargar las ventas. Revisa que el gateway, ms-ventas y ms-usuarios estén encendidos.
        </p>
      )}

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° de Venta</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Método de Pago</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibles.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                {hayFiltros ? 'Ninguna venta coincide con los filtros.' : 'No hay ventas registradas.'}
              </TableCell>
            </TableRow>
          )}

          {visibles.map((venta) => (
            <TableRow key={venta.numeroVenta}>
              <TableCell className="font-medium">{String(venta.numeroVenta).padStart(4, '0')}</TableCell>
              <TableCell>{nombreCliente(venta)}</TableCell>
              <TableCell>{soloFecha(venta.fecha)}</TableCell>

              {/* Total neto (HU-57 criterio 4). Si hubo reembolso, se ve también el total original tachado */}
              <TableCell className="text-right">
                <div className="font-medium">{pesos(venta.totalNeto)}</div>
                {venta.montoReembolsado > 0 && (
                  <div className="text-xs text-muted-foreground line-through">{pesos(venta.total)}</div>
                )}
              </TableCell>

              <TableCell>{textoEnum(venta.metodoPago)}</TableCell>

              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger
                    className={buttonVariants({ variant: 'outline', size: 'icon' })}
                    aria-label={`Ver venta ${venta.numeroVenta}`}
                  >
                    <Eye />
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalle de la Venta #{String(venta.numeroVenta).padStart(4, '0')}</DialogTitle>
                      <DialogDescription>
                        Pedido {textoEnum(venta.estadoPedido).toLowerCase()}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p><strong>Cliente:</strong> {nombreCliente(venta)}</p>
                      <p><strong>RUT:</strong> {venta.rutCliente}</p>
                      <p><strong>Fecha:</strong> {fechaHora(venta.fecha)}</p>
                      <p><strong>Método de pago:</strong> {textoEnum(venta.metodoPago)}</p>
                      <p><strong>Estado del pedido:</strong> <Badge variant="secondary">{textoEnum(venta.estadoPedido)}</Badge></p>
                    </div>

                    {/* Productos vendidos (HU-59) */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {venta.items.map((item) => (
                          <TableRow key={item.idItem}>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>{item.nombreProducto}</TableCell>
                            <TableCell className="text-right">{item.cantidad}</TableCell>
                            <TableCell className="text-right">{pesos(item.precioUnitario)}</TableCell>
                            <TableCell className="text-right">{pesos(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={4}>Total (incluye envío)</TableCell>
                          <TableCell className="text-right">{pesos(venta.total)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>

                    {/* Reembolsos de la venta (HU-59 criterio 4) */}
                    {venta.reembolsos.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold">Productos reembolsados</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {venta.reembolsos.map((r, i) => (
                              <TableRow key={`${r.sku}-${i}`}>
                                <TableCell>{soloFecha(r.fechaReembolso)}</TableCell>
                                <TableCell>
                                  {venta.items.find((item) => item.sku === r.sku)?.nombreProducto ?? r.sku}
                                </TableCell>
                                <TableCell className="text-right">{r.cantidad}</TableCell>
                                <TableCell className="text-right">−{pesos(r.monto)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Resumen de montos */}
                    <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span>{pesos(venta.total)}</span>
                      </div>
                      {venta.montoReembolsado > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Reembolsado</span>
                          <span>−{pesos(venta.montoReembolsado)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 font-semibold">
                        <span>Total neto</span>
                        <span>{pesos(venta.totalNeto)}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Suma de lo filtrado + paginación */}
      {filtradas.length > 0 && (
        <p className="text-right text-sm">
          Total neto {hayFiltros ? 'de las ventas filtradas' : 'de todas las ventas'}:{' '}
          <strong>{pesos(totalFiltrado)}</strong>
        </p>
      )}
      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={filtradas.length}
        nombre={['venta', 'ventas']}
        onCambiar={setPagina}
      />
    </section>
  );
};

export default VentasPage;
