import { useMemo, useState } from 'react';
import { Sparkles, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import type { MenuItem, OrderRecord, PairingRecommendation } from '../types/coffea';
import { computePerfectPairings } from '../utils/recommendationEngine';
import { MediaCrop } from './MediaCrop';

interface PerfectPairingSectionProps {
  menu: MenuItem[];
  orderHistory: OrderRecord[];
  onAddPairing: (pairing: PairingRecommendation) => void;
}

const MOODS: { id: 'todo' | 'energia' | 'dulce' | 'salado'; label: string }[] = [
  { id: 'todo', label: 'Todo el día' },
  { id: 'energia', label: 'Mañana energética' },
  { id: 'dulce', label: 'Tarde dulce' },
  { id: 'salado', label: 'Pausa salada' },
];

export function PerfectPairingSection({
  menu,
  orderHistory,
  onAddPairing,
}: PerfectPairingSectionProps) {
  const [mood, setMood] = useState<'todo' | 'energia' | 'dulce' | 'salado'>('todo');

  const { chefPick, trendingPick, alternatives, topFlavorSummary } = useMemo(
    () => computePerfectPairings(orderHistory, menu, mood),
    [orderHistory, menu, mood],
  );

  const renderPairingCard = (rec: PairingRecommendation, accent: 'chef' | 'trend') => (
    <article
      key={rec.id}
      className={`flex flex-col justify-between rounded-xl border p-6 transition-colors ${
        accent === 'chef'
          ? 'border-[#122347]/35 bg-[#FAF5EE] shadow-sm'
          : 'border-[#D2AC79]/55 bg-[#FAF5EE]'
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D2AC79]/40 pb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#122347]">
            {accent === 'chef' ? (
              <Sparkles className="h-3.5 w-3.5 text-[#E5C36B]" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-[#D2AC79]" />
            )}
            <span>{rec.badge}</span>
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-[#122347]">
            Ahorras Q{rec.savings.toFixed(2)}
          </span>
        </div>

        <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.015em] text-[#422E24]">
          {rec.headline}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#422E24]/80">{rec.rationale}</p>

        {/* Dual Product Preview Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[rec.drink, rec.pastry].map((part) => (
            <div
              key={part.id}
              className="flex items-center gap-3 rounded-lg border border-[#D2AC79]/45 bg-[#EFE3D5]/55 p-2.5"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#EFE3D5]">
                <MediaCrop
                  src={part.photo}
                  alt={part.name}
                  photoX={part.photoX}
                  photoY={part.photoY}
                  photoSize={part.photoSize}
                  isAtlas={part.isAtlas}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#422E24]">{part.name}</p>
                <p className="mt-0.5 text-[11px] text-[#422E24]/70">{part.subCategory}</p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-[#422E24]/85">
                  Q{part.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#D2AC79]/40 pt-4">
        <div>
          <span className="font-mono text-xs tabular-nums text-[#422E24]/55 line-through">
            Q{rec.regularTotal.toFixed(2)}
          </span>
          <div className="font-mono text-xl font-semibold tabular-nums text-[#422E24]">
            Q{rec.pairingPrice.toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onAddPairing(rec)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#122347] px-4 py-2.5 text-sm font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
        >
          <Plus className="h-4 w-4 text-[#E5C36B]" />
          <span>Agregar combinación</span>
        </button>
      </div>
    </article>
  );

  return (
    <section id="perfect-pairing" className="bg-coffea-fiber scroll-mt-20 border-b border-[#D2AC79]/45 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
              Motor de Recomendaciones Inteligentes
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-[#422E24] sm:text-4xl">
              Sugerencia del Chef & Perfect Pairing
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#422E24]/80">
              Calculado en vivo con las tendencias de la barra y tu afinidad por{' '}
              <span className="font-semibold text-[#422E24]">{topFlavorSummary}</span>. Cada
              combinación incluye 10% de beneficio directo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar maridaje por momento">
            {MOODS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mood === item.id}
                onClick={() => setMood(item.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  mood === item.id
                    ? 'bg-[#122347] text-[#FAF5EE]'
                    : 'border border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24] hover:border-[#122347]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Side-by-Side Pairings */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {renderPairingCard(chefPick, 'chef')}
          {renderPairingCard(trendingPick, 'trend')}
        </div>

        {/* Compact Secondary Pairings Strip (Kraft Natural secondary cards) */}
        {alternatives.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alternatives.slice(0, 4).map((alt) => (
              <div
                key={alt.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#D2AC79]/70 bg-[#D2AC79]/20 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#422E24]">{alt.headline}</p>
                  <p className="mt-0.5 truncate text-xs text-[#422E24]/75">
                    {alt.drink.name} + {alt.pastry.name}
                  </p>
                  <p className="mt-1 font-mono text-xs font-semibold tabular-nums text-[#122347]">
                    Q{alt.pairingPrice.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddPairing(alt)}
                  aria-label={`Agregar ${alt.headline}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D2AC79] bg-[#FAF5EE] text-[#422E24] transition-colors hover:bg-[#122347] hover:text-[#FAF5EE]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
