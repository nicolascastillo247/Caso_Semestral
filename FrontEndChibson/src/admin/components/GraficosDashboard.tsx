import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from 'recharts';

import { pesos } from '../../utils/formato';
import {
  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '../../components/ui/chart';

// Gráficos del Dashboard, hechos con el componente Chart de shadcn (usa la librería Recharts).
// Colores: un solo azul para todo lo que es "ventas" y gris para el mes pasado (solo es referencia).
const AZUL = { light: '#2a78d6', dark: '#3987e5' };
const GRIS = { light: '#898781', dark: '#898781' };

// $1.890.000 → "$1,9 M" · $450.000 → "$450 mil" (para los ejes, donde hay poco espacio)
export const pesosCorto = (monto: number) => {
  if (Math.abs(monto) >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (Math.abs(monto) >= 1_000) return `$${Math.round(monto / 1_000)} mil`;
  return pesos(monto);
};

// Fila del tooltip: nombre de la serie a la izquierda y el monto en pesos a la derecha
const filaTooltip = (texto: string, valor: unknown, formato: (n: number) => string) => (
  <div className="flex w-full items-center justify-between gap-4">
    <span className="text-muted-foreground">{texto}</span>
    <span className="font-mono font-medium tabular-nums">{formato(Number(valor))}</span>
  </div>
);

// ---------- 1. Ventas por día (área) ----------

export interface PuntoDia {
  etiqueta: string; // "lun 3"
  fecha: string; // "lunes, 3 de noviembre"
  monto: number;
}

const configVentas = { monto: { label: 'Ventas netas', theme: AZUL } } satisfies ChartConfig;

export const GraficoVentasPorDia = ({ datos }: { datos: PuntoDia[] }) => (
  <ChartContainer config={configVentas} className="aspect-auto h-[260px] w-full">
    <AreaChart data={datos} margin={{ left: 4, right: 12, top: 8 }}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
      <YAxis tickLine={false} axisLine={false} width={76} tickFormatter={(v) => pesosCorto(Number(v))} />
      <ChartTooltip
        cursor={{ strokeDasharray: '4 4' }}
        content={
          <ChartTooltipContent
            labelFormatter={(_: unknown, payload: ReadonlyArray<{ payload?: PuntoDia }>) => payload?.[0]?.payload?.fecha ?? ''}
            formatter={(valor: unknown) => filaTooltip('Ventas netas', valor, pesos)}
          />
        }
      />
      <Area
        dataKey="monto"
        type="monotone"
        stroke="var(--color-monto)"
        strokeWidth={2}
        fill="var(--color-monto)"
        fillOpacity={0.15}
        activeDot={{ r: 5 }}
      />
    </AreaChart>
  </ChartContainer>
);

// ---------- 2. Ventas acumuladas: este mes vs. mes pasado (líneas) ----------

export interface PuntoAcumulado {
  dia: number;
  actual?: number; // vacío en los días que todavía no pasan
  anterior?: number;
}

export const GraficoAcumulado = ({ datos, mes, mesPasado }: { datos: PuntoAcumulado[]; mes: string; mesPasado: string }) => {
  const config = {
    actual: { label: mes, theme: AZUL },
    anterior: { label: mesPasado, theme: GRIS },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <LineChart data={datos} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis tickLine={false} axisLine={false} width={76} tickFormatter={(v) => pesosCorto(Number(v))} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_: unknown, payload: ReadonlyArray<{ payload?: PuntoAcumulado }>) =>
                `Del 1 al ${payload?.[0]?.payload?.dia ?? ''}`
              }
              formatter={(valor: unknown, nombre: unknown) => filaTooltip(nombre === 'actual' ? mes : mesPasado, valor, pesos)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {/* El mes pasado va en gris y punteado: es la referencia, no el dato principal */}
        <Line dataKey="anterior" type="monotone" stroke="var(--color-anterior)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        <Line dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ChartContainer>
  );
};

// ---------- 3 y 4. Barras horizontales ordenadas (categorías y regiones) ----------

export interface FilaBarra {
  nombre: string;
  valor: number;
}

export const GraficoBarras = ({
  datos, etiqueta, formato,
}: { datos: FilaBarra[]; etiqueta: string; formato: (n: number) => string }) => {
  const config = { valor: { label: etiqueta, theme: AZUL } } satisfies ChartConfig;
  // El alto crece con la cantidad de barras, así nunca quedan apretadas
  const alto = datos.length * 40 + 16;

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: alto }}>
      <BarChart data={datos} layout="vertical" margin={{ left: 0, right: 88, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="nombre" tickLine={false} axisLine={false} width={104} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel formatter={(valor: unknown, _nombre: unknown, item: { payload?: FilaBarra }) =>
                filaTooltip(item?.payload?.nombre ?? etiqueta, valor, formato)
              } />}
        />
        <Bar dataKey="valor" fill="var(--color-valor)" radius={4} barSize={20}>
          <LabelList dataKey="valor" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(v) => formato(Number(v))} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};
