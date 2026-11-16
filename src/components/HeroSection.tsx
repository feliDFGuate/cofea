import { useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play, Sparkles } from 'lucide-react';
import { MEDIA_ASSETS } from '../data/coffeaData';
import type { LoyaltyTier, OrderRecord } from '../types/coffea';
import { getOrderStatusLabel } from '../utils/orderStatus';

interface HeroSectionProps {
  customerName: string;
  tier: LoyaltyTier;
  points: number;
  savedCount: number;
  lastOrder?: OrderRecord;
  onExploreMenu: () => void;
  onOpenStudio: () => void;
  onOpenNotifications: () => void;
}

export function HeroSection({
  customerName,
  tier,
  points,
  savedCount,
  lastOrder,
  onExploreMenu,
  onOpenStudio,
  onOpenNotifications,
}: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [paused, setPaused] = useState(false);

  const togglePlayback = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      try {
        await vid.play();
        setPaused(false);
      } catch {
        setPaused(true);
      }
    } else {
      vid.pause();
      setPaused(true);
    }
  };

  const nextThreshold = tier === 'Bronce' ? 250 : tier === 'Plata' ? 700 : null;
  const remainingToNext = nextThreshold ? Math.max(0, nextThreshold - points) : 0;

  return (
    <section className="bg-coffea-fiber border-b border-[#D2AC79]/45">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* 2-Column Editorial Split */}
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Copy Column */}
          <div className="flex flex-col justify-between py-2 lg:col-span-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
                COFFEA · Cafés Especiales · Modra Zona 4
              </p>
              <h1
                className="mt-5 font-display text-4xl font-medium leading-[1.06] tracking-[-0.025em] text-[#422E24] sm:text-5xl lg:text-[56px]"
                style={{ textWrap: 'balance' }}
              >
                El café merece su propia casa.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[#422E24]/85">
                Granos guatemaltecos tostados en Antigua Guatemala. Espresso, métodos manuales,
                maridajes inteligentes según tu historial y bebidas diseñadas a tu medida.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreMenu}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#122347] px-5 py-3.5 text-sm font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                >
                  <span>Explorar carta</span>
                  <ArrowUpRight className="h-4 w-4 text-[#E5C36B]" />
                </button>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D2AC79] bg-[#FAF5EE] px-4 py-3.5 text-sm font-medium text-[#422E24] transition-colors hover:border-[#122347]"
                >
                  <Sparkles className="h-4 w-4 text-[#122347]" />
                  <span>Barista Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('tour-sistema')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#122347]/25 bg-[#D2AC79]/25 px-4 py-3.5 text-sm font-medium text-[#422E24] transition-colors hover:bg-[#122347] hover:text-[#FAF5EE]"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Cómo funciona</span>
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-[#D2AC79]/45 pt-5 text-xs text-[#422E24]/75">
              <span>Antigua Guatemala · Acatenango · Sacatepéquez · Retiro en barra o entrega en Modra</span>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-[#D2AC79]/50 bg-[#122347] lg:col-span-6 lg:min-h-[420px]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover object-center"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={MEDIA_ASSETS.heroPoster}
            >
              <source src={MEDIA_ASSETS.heroVideo} type="video/mp4" />
            </video>
            <img
              src={MEDIA_ASSETS.heroPourOver}
              alt="Preparación artesanal en la barra de COFFEA"
              className="sr-only"
              referrerPolicy="no-referrer"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#122347]/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
              <div className="text-[#FAF5EE]">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#E5C36B]">
                  Barra de Especialidad
                </p>
                <p className="mt-1 font-display text-lg font-medium">
                  Espresso · AeroPress · Pour Over · Cold Brew 48h
                </p>
              </div>
              <button
                type="button"
                onClick={togglePlayback}
                aria-label={paused ? 'Reproducir video de barra' : 'Pausar video de barra'}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5C36B]/40 bg-[#122347]/80 px-3 py-2 text-xs font-medium text-[#FAF5EE] backdrop-blur-sm transition-colors hover:bg-[#122347]"
              >
                {paused ? <Play className="h-3.5 w-3.5 text-[#E5C36B]" /> : <Pause className="h-3.5 w-3.5 text-[#E5C36B]" />}
                <span>{paused ? 'Reproducir' : 'Pausar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Customer Status Strip */}
        <div className="mt-8 grid grid-cols-2 divide-y divide-[#D2AC79]/35 rounded-xl border border-[#D2AC79]/55 bg-[#FAF5EE] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="p-4 sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/70">
              Socio · Nivel Club
            </p>
            <p className="mt-1.5 font-display text-xl font-medium text-[#422E24]">
              {tier}
            </p>
            <p className="mt-0.5 text-xs text-[#422E24]/75">{customerName}</p>
          </div>

          <div className="p-4 sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/70">
              Puntos Disponibles
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-[#122347]">
              {points} pts
            </p>
            <p className="mt-0.5 text-xs text-[#422E24]/75">
              {nextThreshold
                ? `A ${remainingToNext} pts de ${tier === 'Bronce' ? 'Plata' : 'Oro'}`
                : 'Nivel máximo desbloqueado'}
            </p>
          </div>

          <div className="p-4 sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/70">
              Creaciones en Perfil
            </p>
            <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-[#422E24]">
              {savedCount}
            </p>
            <p className="mt-0.5 text-xs text-[#422E24]/75">Recetas listas en Studio</p>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="p-4 text-left transition-colors hover:bg-[#EFE3D5]/60 sm:px-6 sm:py-5"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/70">
              Último Pedido
            </p>
            <p className="mt-1.5 truncate font-mono text-base font-medium text-[#422E24]">
              {lastOrder ? `#${lastOrder.id} · Q${lastOrder.totalPaid.toFixed(2)}` : 'Sin historial'}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-[#122347]">
              {lastOrder
                ? `${getOrderStatusLabel(lastOrder.status, lastOrder.deliveryType)} · ${lastOrder.items[0]?.name ?? ''}`
                : 'Explora la carta'}
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}
