import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardList,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  SkipBack,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { MEDIA_ASSETS } from '../data/coffeaData';
import { MediaCrop } from './MediaCrop';

interface SystemTourSectionProps {
  onJumpToSection: (sectionId: string) => void;
  onOpenOperations: () => void;
}

interface TourScene {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  voiceover: string;
  metricLabel: string;
  metricValue: string;
  actionLabel: string;
  targetSection?: string;
  isOps?: boolean;
}

const SCENES: TourScene[] = [
  {
    id: 'pairing',
    step: '01 / 05',
    title: 'Perfect Pairing Inteligente',
    subtitle: 'Recomendaciones según el paladar del cliente y tendencias de barra',
    voiceover:
      'El motor lee el historial de cada cliente (por ejemplo: notas especiadas o cacao) y le sugiere en 1 clic su bebida ideal acompañada de un postre con 10% de ahorro.',
    metricLabel: 'Impacto en venta',
    metricValue: '+18% ticket promedio',
    actionLabel: 'Probar Perfect Pairing',
    targetSection: 'perfect-pairing',
  },
  {
    id: 'studio',
    step: '02 / 05',
    title: 'Barista Studio · Bebida a Medida',
    subtitle: 'Personalización visual capa por capa + guardado en perfil',
    voiceover:
      'El cliente elige base, preparación (Cold Foam, Iced, Infusión), leche vegetal, siropes y toppings. Nombra su receta ("Bruma de Antigua") y la reordena cuando quiera.',
    metricLabel: 'Frecuencia',
    metricValue: 'Reorden en 1 clic',
    actionLabel: 'Abrir Barista Studio',
    targetSection: 'barista-studio',
  },
  {
    id: 'loyalty',
    step: '03 / 05',
    title: 'Club COFFEA · Bronce, Plata y Oro',
    subtitle: '1 punto por cada Q1 gastado, micro-lotes exclusivos y canjes a Q0.00',
    voiceover:
      'Al superar 250 pts (Plata), la leche de avena o almendra pasa a ser cortesía, se desbloquean cosechas reservadas y puede canjear bebidas o regalos de cumpleaños.',
    metricLabel: 'Acumulación',
    metricValue: '1 pt = Q1.00 gastado',
    actionLabel: 'Explorar Club COFFEA',
    targetSection: 'club-lealtad',
  },
  {
    id: 'checkout',
    step: '04 / 05',
    title: 'Pedido Ágil, Promos y Modra Delivery',
    subtitle: 'Promoción automática 3×Q55 en empanadas + retiro o puerta',
    voiceover:
      'El carrito aplica descuentos automáticos, calcula los puntos a acreditar antes de confirmar y permite elegir retiro en cafetería o entrega directa a apartamento en Modra Zona 4.',
    metricLabel: 'Tiempo de orden',
    metricValue: '< 35 segundos',
    actionLabel: 'Ver la carta',
    targetSection: 'carta',
  },
  {
    id: 'operations',
    step: '05 / 05',
    title: 'Comandas en Barra, Inventario y Eventos',
    subtitle: 'Cada compra entra a cocina y descuenta insumos en tiempo real',
    voiceover:
      'El equipo en barra recibe la comanda al instante (Recibido → Preparando → Listo), descuenta gramos de café y unidades de vitrina, y cotiza eventos en segundos.',
    metricLabel: 'Control operativo',
    metricValue: '100% sincronizado',
    actionLabel: 'Abrir Panel Operaciones',
    isOps: true,
  },
];

const SCENE_DURATION_MS = 5500;

export function SystemTourSection({
  onJumpToSection,
  onOpenOperations,
}: SystemTourSectionProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const tick = 50;
    const timer = setInterval(() => {
      setElapsedMs((prev) => {
        if (prev + tick >= SCENE_DURATION_MS) {
          setSceneIndex((idx) => (idx + 1) % SCENES.length);
          return 0;
        }
        return prev + tick;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [isPlaying, sceneIndex]);

  const currentScene = SCENES[sceneIndex];
  const progressPct = Math.min(100, (elapsedMs / SCENE_DURATION_MS) * 100);

  const selectScene = (idx: number) => {
    setSceneIndex(idx);
    setElapsedMs(0);
  };

  const handleAction = () => {
    if (currentScene.isOps) {
      onOpenOperations();
    } else if (currentScene.targetSection) {
      onJumpToSection(currentScene.targetSection);
    }
  };

  return (
    <section
      id="tour-sistema"
      className="bg-coffea-dark-fiber scroll-mt-20 border-b border-[#E5C36B]/20 py-14 text-[#FAF5EE] sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + Controls */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E5C36B]">
              Video Interactivo del Ecosistema COFFEA
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-[#FAF5EE] sm:text-4xl">
              Cómo funciona el sistema completo en 25 segundos
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#EFE3D5]/85">
              Recorrido animado paso a paso desde que el cliente descubre su maridaje hasta que la
              comanda llega a la barra y actualiza tu inventario.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectScene((sceneIndex - 1 + SCENES.length) % SCENES.length)}
              aria-label="Escena anterior"
              className="rounded-lg border border-[#E5C36B]/30 bg-white/5 p-2.5 text-[#FAF5EE] transition-colors hover:bg-white/15"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E5C36B] px-4 py-2.5 text-xs font-semibold text-[#122347] transition-colors hover:bg-[#edd289]"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pausar recorrido' : 'Reproducir'}</span>
            </button>
            <button
              type="button"
              onClick={() => selectScene((sceneIndex + 1) % SCENES.length)}
              aria-label="Siguiente escena"
              className="rounded-lg border border-[#E5C36B]/30 bg-white/5 p-2.5 text-[#FAF5EE] transition-colors hover:bg-white/15"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                selectScene(0);
                setIsPlaying(true);
              }}
              aria-label="Reiniciar video recorrido"
              className="rounded-lg border border-[#E5C36B]/30 bg-white/5 p-2.5 text-[#FAF5EE] transition-colors hover:bg-white/15"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 5-Segment Reel Progress Bar */}
        <div className="mt-8 grid grid-cols-5 gap-2">
          {SCENES.map((scene, idx) => {
            const fillWidth =
              idx < sceneIndex ? 100 : idx === sceneIndex ? progressPct : 0;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => selectScene(idx)}
                className="group text-left focus:outline-none"
              >
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full bg-[#E5C36B] transition-[width] duration-75"
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
                <p
                  className={`mt-2 truncate text-[11px] font-medium transition-colors ${
                    idx === sceneIndex ? 'text-[#E5C36B]' : 'text-[#FAF5EE]/65 group-hover:text-[#FAF5EE]'
                  }`}
                >
                  {scene.step.split('/')[0].trim()} · {scene.title.split('·')[0].trim()}
                </p>
              </button>
            );
          })}
        </div>

        {/* Main Cinema Stage */}
        <div className="mt-6 grid items-stretch gap-6 rounded-2xl border border-[#E5C36B]/20 bg-[#0D1A36]/90 p-5 sm:p-8 lg:grid-cols-12">
          {/* Left Narrative & Script */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#E5C36B]">
                  ESCENA {currentScene.step}
                </span>
                <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-[#FAF5EE] sm:text-3xl">
                  {currentScene.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-[#E5C36B]/90">
                  {currentScene.subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#EFE3D5]/85">
                  {currentScene.voiceover}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#FAF5EE]/60">
                  {currentScene.metricLabel}
                </p>
                <p className="mt-0.5 font-mono text-base font-semibold text-[#E5C36B]">
                  {currentScene.metricValue}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E5C36B] px-4 py-2.5 text-xs font-semibold text-[#122347] transition-colors hover:bg-[#edd289]"
              >
                <span>{currentScene.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Animated Screen Stage */}
          <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-xl border border-[#D2AC79]/30 bg-coffea-fiber p-5 text-[#422E24] lg:col-span-7">
            <AnimatePresence mode="wait">
              {currentScene.id === 'pairing' && (
                <motion.div
                  key="vis-pairing"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-lg rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-5 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-[#D2AC79]/40 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#122347]">
                      <Sparkles className="h-3.5 w-3.5 text-[#E5C36B]" />
                      Para tu paladar · Historial detectado
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#122347]">
                      −10% dúo
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-lg bg-[#D2AC79]/20 p-2.5">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                        <MediaCrop
                          src={MEDIA_ASSETS.atlas2}
                          alt="Spiced honey coffee"
                          photoX={100}
                          photoY={33.333}
                          photoSize="400% 400%"
                          isAtlas
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#422E24]">Spiced honey</p>
                        <p className="font-mono text-xs text-[#422E24]/70">Q35.00</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-[#D2AC79]/20 p-2.5">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                        <MediaCrop
                          src={MEDIA_ASSETS.cheesecakesStudio}
                          alt="Cheesecake vasco Lotus"
                          photoX={0}
                          photoY={50}
                          photoSize="300% 100%"
                          isAtlas
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#422E24]">Cheesecake Lotus</p>
                        <p className="font-mono text-xs text-[#422E24]/70">Q38.00</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#D2AC79]/40 pt-3">
                    <span className="font-mono text-sm font-semibold text-[#422E24]">
                      Combinación: Q66.00 <span className="text-xs font-normal text-[#422E24]/60 line-through">Q73.00</span>
                    </span>
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="rounded-lg bg-[#122347] px-3 py-1.5 text-xs font-medium text-[#FAF5EE]"
                    >
                      + Agregar dúo
                    </motion.span>
                  </div>
                </motion.div>
              )}

              {currentScene.id === 'studio' && (
                <motion.div
                  key="vis-studio"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="grid w-full max-w-lg items-center gap-4 rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-5 shadow-md sm:grid-cols-2"
                >
                  <div className="flex flex-col items-center justify-center rounded-lg bg-[#D2AC79]/20 py-5">
                    <Coffee className="h-12 w-12 text-[#122347]" strokeWidth={1.5} />
                    <p className="mt-2 font-display text-lg font-medium text-[#422E24]">Bruma de Antigua</p>
                    <p className="font-mono text-xs text-[#122347]">Guardada en perfil · Q46.00</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      '01 · Cold Brew 48h',
                      '02 · Cold Foam de Vainilla',
                      '03 · Leche de Avena Barista',
                      '04 · Lavanda & Naranja (2x)',
                      '05 · Flor de Lavanda Seca',
                    ].map((layer, i) => (
                      <motion.div
                        key={layer}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.14 }}
                        className="flex items-center gap-2 rounded-md border border-[#D2AC79]/45 bg-[#EFE3D5]/55 px-2.5 py-1.5 font-medium text-[#422E24]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#122347]" />
                        <span>{layer}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentScene.id === 'loyalty' && (
                <motion.div
                  key="vis-loyalty"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-lg rounded-xl bg-[#122347] p-5 text-[#FAF5EE] shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#E5C36B]">
                      <Award className="h-4 w-4" />
                      Club COFFEA · Sube a Nivel Plata
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#E5C36B]">295 pts</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#FAF5EE]/75">
                      <span>Bronce (0) → Plata (250)</span>
                      <span className="font-mono">Oro (700+)</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                      <motion.div
                        initial={{ width: '32%' }}
                        animate={{ width: '68%' }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full rounded-full bg-[#E5C36B]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                      <p className="font-semibold text-[#E5C36B]">Avena / Almendra Gratis</p>
                      <p className="mt-0.5 text-[#FAF5EE]/75">Desbloqueado desde Plata</p>
                    </div>
                    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                      <p className="font-semibold text-[#E5C36B]">Canje Instantáneo Q0.00</p>
                      <p className="mt-0.5 text-[#FAF5EE]/75">Bebidas, postres y bolsas</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentScene.id === 'checkout' && (
                <motion.div
                  key="vis-checkout"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-lg rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-5 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-[#D2AC79]/40 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#422E24]">
                      <ShoppingBag className="h-4 w-4 text-[#122347]" />
                      Tu Pedido · #COF-4918
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#122347]">
                      Entrega Modra · Apto 804
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-[#422E24]">
                    <div className="flex justify-between">
                      <span>3× Empanadas surtidas (Promo 3×Q55)</span>
                      <span className="font-mono font-semibold">Q55.00</span>
                    </div>
                    <div className="flex justify-between text-[#122347]">
                      <span>1× Cheesecake Vasco · Canje 190 pts</span>
                      <span className="font-mono font-semibold">Q0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1× Bruma de Antigua (Studio)</span>
                      <span className="font-mono font-semibold">Q46.00</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#D2AC79]/40 pt-3">
                    <span className="font-mono text-xs text-[#122347]">+101 pts acreditados</span>
                    <span className="font-mono text-base font-bold text-[#422E24]">Total Q101.00</span>
                  </div>
                </motion.div>
              )}

              {currentScene.id === 'operations' && (
                <motion.div
                  key="vis-ops"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-lg rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-5 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-[#D2AC79]/40 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#422E24]">
                      <ClipboardList className="h-4 w-4 text-[#122347]" />
                      Consola de Barra & Stock en Vivo
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#122347]">
                      Sincronizado
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    {['Recibido', 'Preparando', 'Listo'].map((st, idx) => (
                      <motion.div
                        key={st}
                        initial={{ opacity: 0.45 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.35 }}
                        className={`rounded-lg border p-2.5 font-semibold ${
                          idx === 2
                            ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                            : 'border-[#D2AC79]/45 bg-[#EFE3D5]/60 text-[#422E24]'
                        }`}
                      >
                        {st}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-[#D2AC79]/40 pt-3 text-xs text-[#422E24]/80">
                    <div className="flex justify-between">
                      <span>Grano Antigua Lavado</span>
                      <span className="font-mono text-[#422E24]">−18 g descontados</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Empanadas artesanales</span>
                      <span className="font-mono text-[#422E24]">−3 u descontadas</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
