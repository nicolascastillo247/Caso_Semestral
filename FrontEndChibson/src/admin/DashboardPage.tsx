import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle, ArrowRight, CalendarDays, ClipboardList, LifeBuoy, RefreshCw, TrendingDown, TrendingUp,
} from 'lucide-react';

import useDashboard from '../hooks/useDashboard';
import type { Venta } from '../services/venta.service';
import { fechaDeHoy, pesos, textoEnum } from '../utils/formato';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';

// ---------- Fechas ----------

// Date → "2026-11-08" (mismo formato que las fechas del backend recortadas a 10 caracteres)
const iso = (d: Date) => d.toLocaleDateString('en-CA');
const diaDe = (fecha: string) => fecha.slice(0, 10);
const entre = (fecha: string, desde: string, hasta: string) => diaDe(fecha) >= desde && diaDe(fecha) <= hasta;
const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const ahora = new Date();
const HOY = iso(ahora);
const DIA_DEL_MES = ahora.getDate();
const INICIO_MES = iso(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
const NOMBRE_MES = mayuscula(ahora.toLocaleDateString('es-CL', { month: 'long' }));

// Mismo tramo del mes pasado (si hoy es 23, del 1 al 23 del mes anterior)
const ultimoDiaMesPasado = new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate();
const INICIO_MES_PASADO = iso(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1));
const FIN_MES_PASADO = iso(new Date(ahora.getFullYear(), ahora.getMonth() - 1, Math.min(DIA_DEL_MES, ultimoDiaMesPasado)));
const NOMBRE_MES_PASADO = mayuscula(
  new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1).toLocaleDateString('es-CL', { month: 'long' }),
);

// Los últimos 7 días, del más antiguo a hoy
const ULTIMOS_7_DIAS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - (6 - i));
  return { iso: iso(d), etiqueta: d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }) };
});

// ---------- Cálculos ----------

const sumaNeta = (ventas: Venta[]) => ventas.reduce((s, v) => s + v.totalNeto, 0);

interface ProductoVendido {
  sku: string;
  nombre: string;
  categoria: string;
  unidades: number;
  ingresos: number;
}

// Unidades e ingresos por producto, descontando lo reembolsado de cada venta
const productosVendidos = (ventas: Venta[]): ProductoVendido[] => {
  const porSku = new Map<string, ProductoVendido>();
  for (const venta of ventas) {
    for (const item of venta.items) {
      const p = porSku.get(item.sku) ?? { sku: item.sku, nombre: item.nombreProducto, categoria: item.categoria, unidades: 0, ingresos: 0 };
      p.unidades += item.cantidad;
      p.ingresos += item.subtotal;
      porSku.set(item.sku, p);
    }
    for (const r of venta.reembolsos) {
      const p = porSku.get(r.sku);
      if (p) {
        p.unidades -= r.cantidad;
        p.ingresos -= r.monto;
      }
    }
  }
  return [...porSku.values()]
    .filter((p) => p.unidades > 0)
    .sort((a, b) => b.unidades - a.unidades || b.ingresos - a.ingresos);
};

// Agrupa y suma: devuelve [etiqueta, valor] de mayor a menor
const agrupar = <T,>(lista: T[], clave: (x: T) => string, valor: (x: T) => number) => {
  const mapa = new Map<string, number>();
  for (const x of lista) mapa.set(clave(x), (mapa.get(clave(x)) ?? 0) + valor(x));
  return [...mapa.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
};

// ---------- Componentes de apoyo ----------

// Tarjeta que lleva a su sección al hacer clic
const TarjetaLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to} className="group block h-full">
    <Card className="h-full transition group-hover:border-zinc-400 group-hover:shadow-md">{children}</Card>
  </Link>
);

const PieTarjeta = ({ texto }: { texto: string }) => (
  <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
    {texto} <ArrowRight className="size-4" />
  </p>
);

const SinDatos = () => <span className="text-base font-normal text-muted-foreground">Sin datos</span>;

// Barras horizontales simples, sin librerías de gráficos
const Barras = ({ filas, formato }: { filas: [string, number][]; formato: (n: number) => string }) => {
  const maximo = Math.max(1, ...filas.map(([, v]) => v));
  return (
    <div className="space-y-2">
      {filas.map(([etiqueta, v]) => (
        <div key={etiqueta} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{etiqueta}</span>
            <span className="font-medium">{formato(v)}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100">
            <div className="h-2 rounded-full bg-zinc-800" style={{ width: `${(v / maximo) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- Página ----------

export const DashboardPage = () => {
  const { datos, loading, recargar } = useDashboard();
  const { ventas, pedidos, stockBajo, ticketsAbiertos, devolucionesPendientes, clientesNuevosHoy } = datos;

  // Ventas del día, del mes y del mismo tramo del mes pasado
  const ventasHoy = ventas?.filter((v) => diaDe(v.fecha) === HOY) ?? [];
  const ventasMes = ventas?.filter((v) => entre(v.fecha, INICIO_MES, HOY)) ?? [];
  const ventasMesPasado = ventas?.filter((v) => entre(v.fecha, INICIO_MES_PASADO, FIN_MES_PASADO)) ?? [];
  const montoMes = sumaNeta(ventasMes);
  const montoMesPasado = sumaNeta(ventasMesPasado);
  const variacion = montoMesPasado > 0 ? ((montoMes - montoMesPasado) / montoMesPasado) * 100 : null;

  const ventas7Dias: [string, number][] = ULTIMOS_7_DIAS.map((d) => [
    d.etiqueta,
    sumaNeta(ventas?.filter((v) => diaDe(v.fecha) === d.iso) ?? []),
  ]);
  const hayVentas7Dias = ventas7Dias.some(([, v]) => v > 0);

  const productosMes = productosVendidos(ventasMes);
  const top5 = productosMes.slice(0, 5);
  const porCategoria = agrupar(productosMes, (p) => textoEnum(p.categoria ?? 'SIN_CATEGORIA'), (p) => p.ingresos);
  const ticketPromedio = ventasMes.length > 0 ? Math.round(montoMes / ventasMes.length) : 0;

  // Pedidos: pendientes de despacho y ventas del mes por región de destino
  const pedidosPendientes = pedidos?.filter((p) => p.estado === 'PAGADO' || p.estado === 'EN_PROCESO').length ?? null;
  const pedidosMes = pedidos?.filter(
    (p) => entre(p.fecha, INICIO_MES, HOY) && p.estado !== 'PENDIENTE' && p.estado !== 'CANCELADO',
  ) ?? [];
  const porRegion = agrupar(pedidosMes, (p) => p.direccion?.region || 'Sin región', () => 1);

  const tramoMes = `${NOMBRE_MES} (1–${DIA_DEL_MES})`;

  return (
    <section className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard general</h1>
          <p className="text-sm text-muted-foreground">{fechaDeHoy()} — vista general de la tienda</p>
        </div>
        <Button variant="outline" onClick={() => void recargar()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Tarjetas principales: cada una lleva a su sección */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <TarjetaLink to="/admin/ventas">
          <CardHeader>
            <CardDescription className="flex items-center gap-1"><CalendarDays className="size-4" /> Hoy</CardDescription>
            <CardTitle>Ventas del día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ventas ? pesos(sumaNeta(ventasHoy)) : <SinDatos />}</p>
            {ventas && (
              <p className="text-sm text-muted-foreground">
                {ventasHoy.length} {ventasHoy.length === 1 ? 'venta registrada' : 'ventas registradas'}
              </p>
            )}
          </CardContent>
        </TarjetaLink>

        <TarjetaLink to="/admin/ventas">
          <CardHeader>
            <CardDescription>{NOMBRE_MES}</CardDescription>
            <CardTitle>Ventas del mes (1–{DIA_DEL_MES})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ventas ? pesos(montoMes) : <SinDatos />}</p>
            {ventas && (
              <>
                {variacion === null ? (
                  <p className="text-sm text-muted-foreground">Sin ventas el mes pasado para comparar</p>
                ) : (
                  <p className={`flex items-center gap-1 text-sm ${variacion >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {variacion >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    {variacion >= 0 ? '+' : ''}{variacion.toFixed(1).replace('.', ',')}% vs. mes pasado
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {NOMBRE_MES_PASADO} (1–{FIN_MES_PASADO.slice(8)}): {pesos(montoMesPasado)}
                </p>
              </>
            )}
          </CardContent>
        </TarjetaLink>

        <TarjetaLink to="/admin/pedidos">
          <CardHeader>
            <CardDescription className="flex items-center gap-1"><ClipboardList className="size-4" /> Pagados o en proceso</CardDescription>
            <CardTitle>Pedidos pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pedidosPendientes ?? <SinDatos />}</p>
            <PieTarjeta texto="Ver pedidos" />
          </CardContent>
        </TarjetaLink>

        <TarjetaLink to="/admin/productos">
          <CardHeader>
            <CardDescription className="flex items-center gap-1"><AlertTriangle className="size-4" /> Bajo el mínimo</CardDescription>
            <CardTitle>Productos con stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stockBajo ? stockBajo.length : <SinDatos />}</p>
            <PieTarjeta texto="Ver productos" />
          </CardContent>
        </TarjetaLink>

        <TarjetaLink to="/admin/soporte">
          <CardHeader>
            <CardDescription className="flex items-center gap-1"><LifeBuoy className="size-4" /> Sin resolver</CardDescription>
            <CardTitle>Tickets de soporte abiertos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ticketsAbiertos ?? <SinDatos />}</p>
            <PieTarjeta texto={ticketsAbiertos === 0 ? 'Sin tickets pendientes' : 'Ver tickets'} />
          </CardContent>
        </TarjetaLink>
      </div>

      {/* Últimos 7 días + resumen rápido */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas de los últimos 7 días</CardTitle>
            <CardDescription>Se actualiza al ingresar al dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {!ventas ? (
              <SinDatos />
            ) : hayVentas7Dias ? (
              <Barras filas={ventas7Dias} formato={pesos} />
            ) : (
              <p className="text-sm text-muted-foreground">No hay ventas registradas en los últimos 7 días.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen rápido</CardTitle>
            <CardDescription>{tramoMes}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Ticket promedio</span>
              <strong>{ventas ? pesos(ticketPromedio) : '—'}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span>Producto más vendido</span>
              <strong className="text-right">{top5[0]?.nombre ?? '—'}</strong>
            </div>
            <Link to="/admin/usuarios" className="flex justify-between hover:underline">
              <span>Nuevos clientes hoy</span>
              <strong>{clientesNuevosHoy ?? '—'}</strong>
            </Link>
            <Link to="/admin/pedidos" className="flex justify-between hover:underline">
              <span>Devoluciones abiertas</span>
              <strong>{devolucionesPendientes ?? '—'}</strong>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Categorías + top 5 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por categoría</CardTitle>
            <CardDescription>{tramoMes}</CardDescription>
          </CardHeader>
          <CardContent>
            {porCategoria.length > 0 ? (
              <Barras filas={porCategoria} formato={pesos} />
            ) : (
              <p className="text-sm text-muted-foreground">Sin ventas este mes.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Top 5 productos más vendidos</CardTitle>
              <CardDescription>Por unidades vendidas — {tramoMes}</CardDescription>
            </div>
            <Link to="/admin/productos" className="text-sm text-muted-foreground hover:text-foreground">Ver productos</Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top5.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Sin ventas este mes.</TableCell>
                  </TableRow>
                )}
                {top5.map((p, i) => (
                  <TableRow key={p.sku}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{textoEnum(p.categoria ?? 'SIN_CATEGORIA')}</TableCell>
                    <TableCell className="text-right">{p.unidades}</TableCell>
                    <TableCell className="text-right">{pesos(p.ingresos)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Regiones + stock bajo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Pedidos por región</CardTitle>
              <CardDescription>Según la región de destino — {tramoMes}</CardDescription>
            </div>
            <Link to="/admin/pedidos" className="text-sm text-muted-foreground hover:text-foreground">Ver pedidos</Link>
          </CardHeader>
          <CardContent>
            {!pedidos ? (
              <SinDatos />
            ) : porRegion.length > 0 ? (
              <Barras filas={porRegion} formato={(n) => `${n} ${n === 1 ? 'pedido' : 'pedidos'}`} />
            ) : (
              <p className="text-sm text-muted-foreground">Sin pedidos este mes.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Productos con stock bajo</CardTitle>
              <CardDescription>Con stock igual o menor a su mínimo</CardDescription>
            </div>
            <Link to="/admin/productos" className="text-sm text-muted-foreground hover:text-foreground">Ver productos</Link>
          </CardHeader>
          <CardContent>
            {!stockBajo ? (
              <SinDatos />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockBajo.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">Todos los productos tienen stock suficiente.</TableCell>
                    </TableRow>
                  )}
                  {stockBajo.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell>{p.marca} {p.modelo}</TableCell>
                      <TableCell>{textoEnum(p.categoria)}</TableCell>
                      <TableCell className="text-right">
                        <span className={p.stockDisponible === 0 ? 'font-semibold text-red-600' : 'font-semibold text-amber-600'}>
                          {p.stockDisponible}
                        </span>
                        <span className="text-muted-foreground"> / mín. {p.stockMinimo}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DashboardPage;
