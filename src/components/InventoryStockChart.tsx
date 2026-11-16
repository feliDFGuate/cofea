import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Plus, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import type { InventoryItem } from '../types/coffea';

interface InventoryStockChartProps {
  inventory: InventoryItem[];
  onAdjustStock: (itemId: string, delta: number) => void;
  onSimulateShiftConsumption: () => void;
}

const THRESHOLD_PRESETS = [
  { label: 'Estándar (1× mín.)', multiplier: 1 },
  { label: 'Preventivo (1.5× mín.)', multiplier: 1.5 },
  { label: 'Fin de semana (2× mín.)', multiplier: 2 },
] as const;

export function InventoryStockChart({
  inventory,
  onAdjustStock,
  onSimulateShiftConsumption,
}: InventoryStockChartProps) {
  const [multiplier, setMultiplier] = useState<number>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const chartRows = useMemo(() => {
    return inventory
      .map((item) => {
        const threshold = Math.round(item.minStock * multiplier);
        const ratioPct = threshold > 0 ? (item.stock / threshold) * 100 : 100;
        // Map 0%..400% of threshold across 0%..100% bar track width so threshold (100%) sits at 25%
        const barWidthPct = Math.min(100, Math.max(2, (ratioPct / 400) * 100));
        const isCritical = item.stock < threshold;
        const deficit = Math.max(0, threshold - item.stock);
        return {
          ...item,
          threshold,
          ratioPct,
          barWidthPct,
          isCritical,
          deficit,
        };
      })
      .sort((a, b) => a.ratioPct - b.ratioPct);
  }, [inventory, multiplier]);

  const criticalCount = chartRows.filter((r) => r.isCritical).length;
  const optimalCount = chartRows.length - criticalCount;

  return (
    <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6 sm:p-7">
      {/* Top Header & Controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#D2AC79]/40 pb-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#122347]">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Monitor visual de existencias</span>
          </div>
          <h2 className="mt-1.5 font-display text-2xl font-medium text-[#422E24]">
            Niveles de stock vs. umbral crítico
          </h2>
          <p className="mt-1 text-sm text-[#422E24]/80">
            Escala normalizada respecto al mínimo operativo de cada insumo. Las barras en rojo
            indican existencias por debajo del umbral crítico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/70 p-1"
            role="group"
            aria-label="Selector de umbral crítico"
          >
            {THRESHOLD_PRESETS.map((preset) => {
              const active = multiplier === preset.multiplier;
              return (
                <button
                  key={preset.multiplier}
                  type="button"
                  onClick={() => setMultiplier(preset.multiplier)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#122347] text-[#E5C36B]'
                      : 'text-[#422E24]/80 hover:text-[#422E24]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onSimulateShiftConsumption}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-3 py-2 text-xs font-medium text-[#422E24] transition-colors hover:border-[#122347]"
          >
            <TrendingDown className="h-3.5 w-3.5 text-[#122347]" />
            <span>Simular consumo de turno</span>
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 divide-x divide-[#D2AC79]/40 border-b border-[#D2AC79]/40 py-4">
        <div className="pr-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            Insumos monitoreados
          </p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#422E24]">
            {chartRows.length}
          </p>
        </div>
        <div className="px-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            Bajo umbral crítico
          </p>
          <p
            className={`mt-1 flex items-center gap-1.5 font-mono text-xl font-semibold tabular-nums ${
              criticalCount > 0 ? 'text-[#DC2626]' : 'text-[#422E24]'
            }`}
          >
            {criticalCount > 0 && <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{criticalCount}</span>
          </p>
        </div>
        <div className="pl-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/65">
            En nivel óptimo
          </p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#122347]">
            {optimalCount}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#422E24]/80">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#DC2626]" aria-hidden="true" />
            <span>Por debajo del umbral crítico</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#122347]" aria-hidden="true" />
            <span>Nivel operativo óptimo</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-3.5 w-0 border-l-2 border-dashed border-[#DC2626]"
              aria-hidden="true"
            />
            <span>Umbral crítico (100% del mínimo)</span>
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#422E24]/60">
          Ordenado de menor a mayor cobertura
        </span>
      </div>

      {/* Horizontal Bar Chart Plot Area */}
      <div className="mt-5">
        {/* X-Axis Header Scale (Desktop & Tablet aligned with bar column) */}
        <div className="hidden grid-cols-12 items-end gap-4 pb-2 text-[11px] font-mono tabular-nums text-[#422E24]/60 md:grid">
          <div className="col-span-4">Insumo</div>
          <div className="relative col-span-6 h-5">
            <span className="absolute left-0 bottom-0">0%</span>
            <span className="absolute left-[25%] bottom-0 -translate-x-1/2 font-semibold text-[#DC2626]">
              100% Crítico
            </span>
            <span className="absolute left-[50%] bottom-0 -translate-x-1/2">200%</span>
            <span className="absolute left-[75%] bottom-0 -translate-x-1/2">300%</span>
            <span className="absolute right-0 bottom-0">400%+</span>
          </div>
          <div className="col-span-2 text-right">Existencia / Mín.</div>
        </div>

        {/* Chart Rows */}
        <div className="relative divide-y divide-[#D2AC79]/35 border-y border-[#D2AC79]/45">
          {chartRows.map((row) => {
            const restockStep = row.unit === 'unidad' ? 10 : 500;
            const isHovered = hoveredId === row.id;

            return (
              <div
                key={row.id}
                onMouseEnter={() => setHoveredId(row.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`grid grid-cols-1 items-center gap-2 py-3.5 transition-colors md:grid-cols-12 md:gap-4 ${
                  isHovered ? 'bg-[#EFE3D5]/55' : 'bg-[#FAF5EE]'
                }`}
              >
                {/* Y-Axis Item Name */}
                <div className="min-w-0 md:col-span-4">
                  <p className="truncate text-sm font-medium text-[#422E24]" title={row.name}>
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#422E24]/70">
                    {row.isCritical ? (
                      <span className="font-semibold text-[#DC2626]">
                        Crítico · Faltan {row.deficit.toLocaleString('es-GT')} {row.unit}
                      </span>
                    ) : (
                      <span>
                        Cobertura {Math.round(row.ratioPct)}% del umbral
                      </span>
                    )}
                  </p>
                </div>

                {/* Bar Track */}
                <div className="relative md:col-span-6">
                  <div className="relative h-7 w-full overflow-hidden rounded-md bg-[#EFE3D5]">
                    {/* Vertical Gridlines */}
                    <span
                      className="pointer-events-none absolute inset-y-0 left-[50%] border-l border-[#D2AC79]/45"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute inset-y-0 left-[75%] border-l border-[#D2AC79]/45"
                      aria-hidden="true"
                    />

                    {/* Critical Threshold Reference Line at 25% (100% of minStock) */}
                    <span
                      className="pointer-events-none absolute inset-y-0 left-[25%] z-10 border-l-2 border-dashed border-[#DC2626]"
                      aria-hidden="true"
                    />

                    {/* Animated Stock Bar */}
                    <motion.div
                      initial={false}
                      animate={{ width: `${row.barWidthPct}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className={`relative z-0 flex h-full items-center justify-end rounded-r-md pr-2 ${
                        row.isCritical ? 'bg-[#DC2626]' : 'bg-[#122347]'
                      }`}
                    >
                      {row.barWidthPct >= 14 && (
                        <span className="font-mono text-[10px] font-semibold tabular-nums text-[#FAF5EE]">
                          {Math.round(row.ratioPct)}%
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Exact Units + Quick Restock when Critical */}
                <div className="flex items-center justify-between gap-2 md:col-span-2 md:justify-end">
                  <div className="text-left md:text-right">
                    <p
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        row.isCritical ? 'text-[#DC2626]' : 'text-[#422E24]'
                      }`}
                    >
                      {row.stock.toLocaleString('es-GT')} {row.unit}
                    </p>
                    <p className="font-mono text-[11px] tabular-nums text-[#422E24]/60">
                      mín. {row.threshold.toLocaleString('es-GT')} {row.unit}
                    </p>
                  </div>

                  {row.isCritical && (
                    <button
                      type="button"
                      onClick={() => onAdjustStock(row.id, restockStep)}
                      title={`Reponer +${restockStep} ${row.unit}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#DC2626]/30 bg-[#FEF2F2] px-2 py-1 font-mono text-[11px] font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{restockStep}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
