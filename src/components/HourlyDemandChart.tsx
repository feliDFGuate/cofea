import { useMemo, useState } from 'react';
import { Clock, TrendingUp, Users } from 'lucide-react';
import type { OrderRecord } from '../types/coffea';

interface HourlyDemandChartProps {
  orders: OrderRecord[];
}

interface HourBucket {
  hour: number;
  label: string;
  shortLabel: string;
  orderCount: number;
  revenue: number;
  itemsCount: number;
}

export function HourlyDemandChart({ orders }: HourlyDemandChartProps) {
  const [metric, setMetric] = useState<'count' | 'revenue'>('count');
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const { buckets, peakBucket, activeHoursCount, totalOrders, totalRevenue } = useMemo(() => {
    const map = new Map<number, { count: number; revenue: number; items: number }>();
    let minHour = 7;
    let maxHour = 20;

    for (const ord of orders) {
      const d = new Date(ord.createdAt);
      const hr = Number.isNaN(d.getTime()) ? 9 : d.getHours();
      if (hr < minHour) minHour = hr;
      if (hr > maxHour) maxHour = hr;

      const cur = map.get(hr) ?? { count: 0, revenue: 0, items: 0 };
      const qtySum = ord.items.reduce((s, it) => s + it.quantity, 0);
      map.set(hr, {
        count: cur.count + 1,
        revenue: cur.revenue + ord.totalPaid,
        items: cur.items + qtySum,
      });
    }

    const built: HourBucket[] = [];
    for (let h = minHour; h <= maxHour; h += 1) {
      const entry = map.get(h) ?? { count: 0, revenue: 0, items: 0 };
      const padded = String(h).padStart(2, '0');
      built.push({
        hour: h,
        label: `${padded}:00 – ${padded}:59`,
        shortLabel: `${padded}h`,
        orderCount: entry.count,
        revenue: entry.revenue,
        itemsCount: entry.items,
      });
    }

    let peak = built[0];
    let activeHours = 0;
    let sumOrders = 0;
    let sumRev = 0;

    for (const b of built) {
      sumOrders += b.orderCount;
      sumRev += b.revenue;
      if (b.orderCount > 0) activeHours += 1;
      const bVal = metric === 'count' ? b.orderCount : b.revenue;
      const peakVal = metric === 'count' ? peak.orderCount : peak.revenue;
      if (bVal > peakVal) {
        peak = b;
      }
    }

    return {
      buckets: built,
      peakBucket: peak,
      activeHoursCount: activeHours,
      totalOrders: sumOrders,
      totalRevenue: sumRev,
    };
  }, [orders, metric]);

  const width = 840;
  const height = 220;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 30;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const rawMax = Math.max(
    metric === 'count' ? 3 : 100,
    ...buckets.map((b) => (metric === 'count' ? b.orderCount : b.revenue)),
  );
  // Nice integer ceiling for clean Y ticks
  const yMax =
    metric === 'count'
      ? Math.max(4, Math.ceil(rawMax))
      : Math.ceil(rawMax / 50) * 50;

  const yTicks =
    metric === 'count'
      ? [0, Math.round(yMax / 2), yMax]
      : [0, Math.round(yMax / 2), yMax];

  const points = buckets.map((b, idx) => {
    const val = metric === 'count' ? b.orderCount : b.revenue;
    const x =
      buckets.length <= 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (buckets.length - 1)) * plotW;
    const y = padTop + plotH - (val / yMax) * plotH;
    return { ...b, val, x, y };
  });

  const linePath = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const activePoint =
    hoveredHour !== null
      ? points.find((p) => p.hour === hoveredHour) ?? null
      : null;

  const strokeColor = metric === 'count' ? '#122347' : '#D2AC79';
  const fillId = metric === 'count' ? 'coffeaDemandArea' : 'coffeaRevenueArea';

  const avgPerActiveHour =
    activeHoursCount > 0 ? (totalOrders / activeHoursCount).toFixed(1) : '0.0';

  const peakWindowLabel =
    peakBucket && peakBucket.orderCount > 0
      ? `${String(peakBucket.hour).padStart(2, '0')}:00 h`
      : 'Sin picos';

  const staffingAdvice =
    peakBucket && peakBucket.orderCount > 0
      ? peakBucket.hour < 12
        ? `Reforzar espresso y empanadas entre ${String(peakBucket.hour).padStart(2, '0')}:00 y ${String(peakBucket.hour + 1).padStart(2, '0')}:00`
        : `Reforzar cold brew y repostería cerca de las ${String(peakBucket.hour).padStart(2, '0')}:00`
      : 'Registra pedidos para proyectar demanda';

  return (
    <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6">
      {/* Header Row */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D2AC79]/40 pb-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#122347]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Curva de demanda horaria · orderHistory</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-medium text-[#422E24]">
            Tendencia de pedidos por hora
          </h2>
          <p className="mt-0.5 text-sm text-[#422E24]/80">
            Agrupa cada comanda por hora del día para anticipar picos en barra y planificar turnos.
          </p>
        </div>

        <div
          className="inline-flex w-fit rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/70 p-1"
          role="group"
          aria-label="Métrica del gráfico de demanda"
        >
          <button
            type="button"
            onClick={() => setMetric('count')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === 'count'
                ? 'bg-[#122347] text-[#E5C36B]'
                : 'text-[#422E24]/80 hover:text-[#422E24]'
            }`}
          >
            Pedidos (u.)
          </button>
          <button
            type="button"
            onClick={() => setMetric('revenue')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              metric === 'revenue'
                ? 'bg-[#122347] text-[#E5C36B]'
                : 'text-[#422E24]/80 hover:text-[#422E24]'
            }`}
          >
            Ingresos (Q)
          </button>
        </div>
      </div>

      {/* Peak Summary Strip */}
      <div className="grid gap-4 border-b border-[#D2AC79]/40 py-4 sm:grid-cols-3 sm:divide-x sm:divide-[#D2AC79]/40">
        <div className="sm:pr-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            <Clock className="h-3 w-3" />
            <span>Hora pico detectada</span>
          </p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-[#122347]">
            {peakWindowLabel}
            {peakBucket && peakBucket.orderCount > 0 && (
              <span className="ml-2 text-xs font-normal text-[#422E24]/75">
                ({peakBucket.orderCount} {peakBucket.orderCount === 1 ? 'pedido' : 'pedidos'} · Q
                {peakBucket.revenue.toFixed(0)})
              </span>
            )}
          </p>
        </div>

        <div className="sm:px-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            <Users className="h-3 w-3" />
            <span>Flujo acumulado</span>
          </p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-[#422E24]">
            {totalOrders} pedidos
            <span className="ml-2 text-xs font-normal text-[#422E24]/75">
              · Prom. {avgPerActiveHour}/h activa · Q{totalRevenue.toFixed(0)}
            </span>
          </p>
        </div>

        <div className="sm:pl-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            Sugerencia operativa
          </p>
          <p className="mt-1 text-xs font-medium leading-relaxed text-[#422E24]">
            {staffingAdvice}
          </p>
        </div>
      </div>

      {/* Interactive Readout Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#422E24]/80">
        <div>
          {activePoint ? (
            <span className="font-medium text-[#422E24]">
              Franja <span className="font-mono">{activePoint.label}</span>:{' '}
              <span className="font-mono font-semibold text-[#122347]">
                {activePoint.orderCount} {activePoint.orderCount === 1 ? 'pedido' : 'pedidos'}
              </span>{' '}
              · {activePoint.itemsCount} ítems ·{' '}
              <span className="font-mono">Q{activePoint.revenue.toFixed(2)}</span>
            </span>
          ) : (
            <span>Pasa el cursor sobre cualquier franja horaria para inspeccionar el detalle.</span>
          )}
        </div>
        <span className="font-mono text-[11px] text-[#422E24]/60">
          Ventana {buckets[0]?.shortLabel} – {buckets[buckets.length - 1]?.shortLabel}
        </span>
      </div>

      {/* Responsive SVG Line Chart */}
      <div className="mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[540px] select-none"
          role="img"
          aria-label="Gráfico de línea de tendencia de pedidos por hora"
        >
          <defs>
            <linearGradient id="coffeaDemandArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#122347" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#122347" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="coffeaRevenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D2AC79" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#D2AC79" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = padTop + plotH - (tick / yMax) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  x2={width - padRight}
                  y1={y}
                  y2={y}
                  stroke="#D2AC79"
                  strokeOpacity={0.45}
                  strokeDasharray={tick === 0 ? undefined : '4 4'}
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#422E24"
                  fillOpacity={0.65}
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {metric === 'revenue' ? `Q${tick}` : tick}
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {areaPath && <path d={areaPath} fill={`url(#${fillId})`} />}

          {/* Trend Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical Hover Crosshair */}
          {activePoint && (
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={padTop}
              y2={padTop + plotH}
              stroke="#122347"
              strokeOpacity={0.28}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          )}

          {/* Data Nodes, Peak Annotation & X-Axis Labels */}
          {points.map((pt) => {
            const isHovered = hoveredHour === pt.hour;
            const isPeak =
              peakBucket &&
              peakBucket.orderCount > 0 &&
              pt.hour === peakBucket.hour;

            return (
              <g key={pt.hour}>
                {/* X-Axis Hour Label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isHovered || isPeak ? '#122347' : '#422E24'}
                  fillOpacity={isHovered || isPeak ? 1 : 0.7}
                  fontWeight={isHovered || isPeak ? 600 : 400}
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {pt.shortLabel}
                </text>

                {/* Peak Tag */}
                {isPeak && (
                  <text
                    x={pt.x}
                    y={Math.max(12, pt.y - 11)}
                    textAnchor="middle"
                    fill="#122347"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    Pico ({metric === 'count' ? pt.orderCount : `Q${pt.revenue.toFixed(0)}`})
                  </text>
                )}

                {/* Node Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : isPeak ? 4.5 : pt.val > 0 ? 3.5 : 2}
                  fill={
                    isPeak
                      ? '#E5C36B'
                      : pt.val > 0
                      ? strokeColor
                      : '#FAF5EE'
                  }
                  stroke={isPeak ? '#122347' : strokeColor}
                  strokeWidth={isHovered ? 2 : 1.5}
                />

                {/* Invisible Wide Hit Target for Smooth Hover */}
                <rect
                  x={pt.x - plotW / Math.max(2, points.length * 2)}
                  y={padTop - 8}
                  width={plotW / Math.max(1, points.length - 1)}
                  height={plotH + 28}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHour(pt.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
