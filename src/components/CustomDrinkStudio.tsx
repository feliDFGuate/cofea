import { useEffect, useState } from 'react';
import { Bookmark, Check, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import {
  CUSTOM_BASES,
  CUSTOM_MILKS,
  CUSTOM_PREPS,
  CUSTOM_SYRUPS,
  CUSTOM_TOPPINGS,
} from '../data/coffeaData';
import type {
  CustomDrinkConfig,
  FlavorTag,
  LoyaltyTier,
  SavedCustomDrink,
} from '../types/coffea';

interface CustomDrinkStudioProps {
  userTier: LoyaltyTier;
  savedDrinks: SavedCustomDrink[];
  presetConfig: CustomDrinkConfig | null;
  onSaveCreation: (drink: SavedCustomDrink) => void;
  onDeleteCreation: (id: string) => void;
  onAddCustomToCart: (config: CustomDrinkConfig, unitPrice: number, summary: string, tags: FlavorTag[]) => void;
}

const DEFAULT_CONFIG: CustomDrinkConfig = {
  name: 'Antigua Bruma',
  baseId: 'espresso-doble',
  prepId: 'cold-foam-cap',
  milkId: 'avena',
  syrupId: 'miel-criolla',
  syrupPumps: 2,
  toppingId: 'canela-rallada',
};

export function CustomDrinkStudio({
  userTier,
  savedDrinks,
  presetConfig,
  onSaveCreation,
  onDeleteCreation,
  onAddCustomToCart,
}: CustomDrinkStudioProps) {
  const [config, setConfig] = useState<CustomDrinkConfig>(DEFAULT_CONFIG);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (presetConfig) {
      setConfig(presetConfig);
    }
  }, [presetConfig]);

  const base = CUSTOM_BASES.find((b) => b.id === config.baseId) ?? CUSTOM_BASES[0];
  const prep = CUSTOM_PREPS.find((p) => p.id === config.prepId) ?? CUSTOM_PREPS[0];
  const milk = CUSTOM_MILKS.find((m) => m.id === config.milkId) ?? CUSTOM_MILKS[0];
  const syrup = CUSTOM_SYRUPS.find((s) => s.id === config.syrupId) ?? CUSTOM_SYRUPS[0];
  const topping = CUSTOM_TOPPINGS.find((t) => t.id === config.toppingId) ?? CUSTOM_TOPPINGS[0];

  const isFreeAltMilk =
    (userTier === 'Plata' || userTier === 'Oro') &&
    (milk.id === 'avena' || milk.id === 'almendra');
  const isFreeColdFoam = userTier === 'Oro' && prep.id === 'cold-foam-cap';

  const milkCost = isFreeAltMilk ? 0 : milk.priceDelta;
  const prepCost = isFreeColdFoam ? 0 : prep.priceDelta;
  const syrupCost =
    syrup.id === 'sin-sirope' || config.syrupPumps === 0
      ? 0
      : syrup.priceDelta + (config.syrupPumps > 1 ? (config.syrupPumps - 1) * 1.5 : 0);

  const unitPrice = Math.round(
    base.priceDelta + prepCost + milkCost + syrupCost + topping.priceDelta,
  );

  const summaryParts = [
    base.label,
    prep.label,
    milk.id !== 'none' ? milk.label : 'Sin leche',
    syrup.id !== 'sin-sirope' && config.syrupPumps > 0
      ? `${syrup.label} (${config.syrupPumps}x)`
      : null,
    topping.id !== 'sin-topping' ? topping.label : null,
  ].filter(Boolean);

  const summaryText = summaryParts.join(' · ');

  const flavorTags: FlavorTag[] = Array.from(
    new Set([base.tag, prep.tag, milk.tag, syrup.tag, topping.tag]),
  );

  const isCold = prep.id === 'iced-shaken' || prep.id === 'cold-foam-cap' || base.id === 'cold-brew-base';
  const hasColdFoam = prep.id === 'cold-foam-cap';

  const handleSaveProfile = () => {
    const cleanName = config.name.trim() || `Mi ${base.label}`;
    const newSaved: SavedCustomDrink = {
      ...config,
      name: cleanName,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      unitPrice,
      summary: summaryText,
    };
    onSaveCreation(newSaved);
    setSaveNotice(`"${cleanName}" guardada en tu perfil`);
    setTimeout(() => setSaveNotice(null), 2600);
  };

  const handleAdd = () => {
    const cleanName = config.name.trim() || `Mi ${base.label}`;
    onAddCustomToCart({ ...config, name: cleanName }, unitPrice, summaryText, flavorTags);
  };

  const renderOptionGroup = (
    title: string,
    stepNum: string,
    options: typeof CUSTOM_BASES,
    selectedId: string,
    onSelect: (id: string) => void,
    priceFormatter?: (opt: (typeof CUSTOM_BASES)[number]) => string,
  ) => (
    <div className="border-b border-[#D2AC79]/40 pb-6 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#422E24]">
          {stepNum} · {title}
        </h3>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const active = opt.id === selectedId;
          const displayPrice = priceFormatter
            ? priceFormatter(opt)
            : opt.priceDelta === 0
            ? 'Incluido'
            : `+Q${opt.priceDelta.toFixed(0)}`;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`flex items-start justify-between gap-2 rounded-xl border p-3.5 text-left transition-colors ${
                active
                  ? 'border-[#122347] bg-[#122347]/[0.05]'
                  : 'border-[#D2AC79]/45 bg-[#FAF5EE] hover:border-[#D2AC79]'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#422E24]">{opt.label}</span>
                  {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#122347]" />}
                </div>
                <p className="mt-0.5 text-xs text-[#422E24]/70">{opt.description}</p>
              </div>
              <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-[#122347]">
                {displayPrice}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      id="barista-studio"
      className="bg-coffea-fiber scroll-mt-20 border-b border-[#D2AC79]/45 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
              Creación de Bebida Personalizada
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-[#422E24] sm:text-4xl">
              Barista Studio · Diseña tu taza
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#422E24]/80">
              Elige base, método de preparación, leche alternativa, sirope artesanal y toppings.
              Nombra tu creación y guárdala en tu perfil para pedirla con un clic.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-3.5 py-2 text-xs font-medium text-[#422E24]/80 hover:border-[#422E24] hover:text-[#422E24]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restablecer receta</span>
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Sticky Live Visualizer & Naming Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6">
              <div className="flex items-center justify-between border-b border-[#D2AC79]/40 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#422E24]/65">
                    Vista previa en barra
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-medium text-[#422E24]">
                    {config.name.trim() || `Mi ${base.label}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-semibold tabular-nums text-[#122347]">
                    Q{unitPrice.toFixed(2)}
                  </span>
                  <p className="font-mono text-[11px] text-[#422E24]/65">+{unitPrice} pts Club</p>
                </div>
              </div>

              {/* Layered SVG Drink Visualizer */}
              <div className="my-6 flex flex-col items-center justify-center rounded-xl border border-[#D2AC79]/35 bg-[#EFE3D5]/55 py-8">
                <svg
                  viewBox="0 0 220 240"
                  className="h-56 w-52"
                  aria-label="Ilustración dinámica de tu bebida personalizada"
                >
                  <defs>
                    <clipPath id="coffeaCupClip">
                      {isCold ? (
                        <path d="M58 50 L162 50 L148 205 Q147 215 137 215 L83 215 Q73 215 72 205 Z" />
                      ) : (
                        <path d="M52 72 L168 72 L156 176 Q152 212 110 212 Q68 212 64 176 Z" />
                      )}
                    </clipPath>
                  </defs>

                  {/* Steam when hot */}
                  {!isCold && (
                    <g stroke="#B8B4AA" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7">
                      <path d="M88 54 Q82 40 90 28" />
                      <path d="M110 50 Q116 34 108 20" />
                      <path d="M132 54 Q126 40 134 28" />
                    </g>
                  )}

                  {/* Cup Handle for Hot */}
                  {!isCold && (
                    <path
                      d="M164 92 C192 92 192 152 159 152"
                      fill="none"
                      stroke="#422E24"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Interior Layers */}
                  <g clipPath="url(#coffeaCupClip)">
                    {/* Base Liquid */}
                    <rect x="40" y="128" width="140" height="95" fill={base.colorHex} />

                    {/* Milk Layer */}
                    {milk.id !== 'none' ? (
                      <rect
                        x="40"
                        y={hasColdFoam ? '86' : '74'}
                        width="140"
                        height={hasColdFoam ? '46' : '58'}
                        fill={milk.colorHex}
                        opacity="0.92"
                      />
                    ) : (
                      <rect x="40" y="74" width="140" height="58" fill={base.colorHex} opacity="0.88" />
                    )}

                    {/* Syrup Ribbon */}
                    {syrup.id !== 'sin-sirope' && config.syrupPumps > 0 && (
                      <path
                        d="M55 196 Q110 184 165 196 L165 215 L55 215 Z"
                        fill={syrup.colorHex}
                        opacity={0.45 + config.syrupPumps * 0.16}
                      />
                    )}

                    {/* Ice Cubes if Cold */}
                    {isCold && (
                      <g fill="#FFFFFF" opacity="0.45" stroke="#FFFFFF" strokeWidth="1.5">
                        <rect x="74" y="96" width="22" height="22" rx="4" transform="rotate(-12 85 107)" />
                        <rect x="116" y="102" width="24" height="24" rx="4" transform="rotate(14 128 114)" />
                        <rect x="92" y="124" width="20" height="20" rx="4" transform="rotate(6 102 134)" />
                      </g>
                    )}

                    {/* Cold Foam Cap */}
                    {hasColdFoam && (
                      <path
                        d="M45 50 L175 50 L175 88 Q140 94 110 88 Q80 82 45 88 Z"
                        fill="#FFFDF8"
                      />
                    )}

                    {/* Toppings Dots / Crumble */}
                    {topping.id !== 'sin-topping' && (
                      <g fill={topping.colorHex}>
                        <circle cx="88" cy={isCold ? 66 : 80} r="2.8" />
                        <circle cx="104" cy={isCold ? 61 : 77} r="3.2" />
                        <circle cx="118" cy={isCold ? 68 : 82} r="2.5" />
                        <circle cx="132" cy={isCold ? 62 : 78} r="3" />
                        <circle cx="96" cy={isCold ? 71 : 84} r="2.2" />
                        <circle cx="125" cy={isCold ? 72 : 84} r="2.2" />
                      </g>
                    )}
                  </g>

                  {/* Cup Outline */}
                  {isCold ? (
                    <path
                      d="M58 50 L162 50 L148 205 Q147 215 137 215 L83 215 Q73 215 72 205 Z"
                      fill="none"
                      stroke="#422E24"
                      strokeWidth="3"
                    />
                  ) : (
                    <>
                      <path
                        d="M52 72 L168 72 L156 176 Q152 212 110 212 Q68 212 64 176 Z"
                        fill="none"
                        stroke="#422E24"
                        strokeWidth="3.5"
                      />
                      <ellipse cx="110" cy="218" rx="64" ry="5" fill="#D2AC79" opacity="0.55" />
                    </>
                  )}
                </svg>

                <p className="mt-3 max-w-xs text-center text-xs leading-relaxed text-[#422E24]/80">
                  {summaryText}
                </p>
              </div>

              {/* Name & Actions */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#422E24]/75">
                    Nombre de tu creación
                  </span>
                  <input
                    type="text"
                    maxLength={40}
                    value={config.name}
                    onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej. Bruma de Antigua"
                    className="mt-1.5 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-3.5 py-2.5 text-sm font-medium text-[#422E24] focus:border-[#122347] focus:outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#422E24] bg-[#FAF5EE] px-4 py-3 text-xs font-semibold text-[#422E24] transition-colors hover:bg-[#D2AC79]/25"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Guardar en perfil</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#122347] px-4 py-3 text-xs font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#E5C36B]" />
                    <span>Agregar al pedido</span>
                  </button>
                </div>

                {saveNotice && (
                  <p className="text-center text-xs font-medium text-[#122347]">{saveNotice}</p>
                )}
              </div>

              {/* Saved Profile Creations */}
              <div className="mt-6 border-t border-[#D2AC79]/40 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#422E24]">
                    <Sparkles className="h-3.5 w-3.5 text-[#122347]" />
                    <span>Tus recetas guardadas ({savedDrinks.length})</span>
                  </h4>
                </div>

                <div className="mt-3 space-y-2.5">
                  {savedDrinks.length === 0 ? (
                    <p className="text-xs text-[#422E24]/70">
                      Guarda tu primera receta para reordenarla en un toque.
                    </p>
                  ) : (
                    savedDrinks.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#D2AC79]/50 bg-[#D2AC79]/20 p-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setConfig({
                              name: saved.name,
                              baseId: saved.baseId,
                              prepId: saved.prepId,
                              milkId: saved.milkId,
                              syrupId: saved.syrupId,
                              syrupPumps: saved.syrupPumps,
                              toppingId: saved.toppingId,
                            })
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-sm font-semibold text-[#422E24]">
                            {saved.name}
                          </p>
                          <p className="truncate text-[11px] text-[#422E24]/75">{saved.summary}</p>
                        </button>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onAddCustomToCart(
                                saved,
                                saved.unitPrice,
                                saved.summary,
                                ['intenso', 'cremoso'],
                              )
                            }
                            className="rounded-md bg-[#122347] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#FAF5EE] hover:bg-[#1B3363]"
                          >
                            + Q{saved.unitPrice}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCreation(saved.id)}
                            aria-label={`Eliminar ${saved.name}`}
                            className="rounded-md p-1.5 text-[#422E24]/65 hover:bg-[#FAF5EE] hover:text-[#DC2626]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Configurator Steps */}
          <div className="space-y-6 rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6 lg:col-span-7">
            {renderOptionGroup(
              'Base de extracción',
              '01',
              CUSTOM_BASES,
              config.baseId,
              (baseId) => setConfig((prev) => ({ ...prev, baseId })),
              (opt) => `Q${opt.priceDelta.toFixed(0)}`,
            )}

            {renderOptionGroup(
              'Método y preparación',
              '02',
              CUSTOM_PREPS,
              config.prepId,
              (prepId) => setConfig((prev) => ({ ...prev, prepId })),
              (opt) =>
                userTier === 'Oro' && opt.id === 'cold-foam-cap'
                  ? 'Cortesía Oro'
                  : opt.priceDelta === 0
                  ? 'Incluido'
                  : `+Q${opt.priceDelta.toFixed(0)}`,
            )}

            {renderOptionGroup(
              'Leche alternativa',
              '03',
              CUSTOM_MILKS,
              config.milkId,
              (milkId) => setConfig((prev) => ({ ...prev, milkId })),
              (opt) => {
                if (opt.priceDelta === 0) return 'Incluido';
                if ((userTier === 'Plata' || userTier === 'Oro') && (opt.id === 'avena' || opt.id === 'almendra')) {
                  return `Cortesía ${userTier}`;
                }
                return `+Q${opt.priceDelta.toFixed(0)}`;
              },
            )}

            {/* Syrups + Pumps */}
            <div>
              {renderOptionGroup(
                'Sirope artesanal',
                '04',
                CUSTOM_SYRUPS,
                config.syrupId,
                (syrupId) =>
                  setConfig((prev) => ({
                    ...prev,
                    syrupId,
                    syrupPumps: syrupId === 'sin-sirope' ? 0 : prev.syrupPumps || 2,
                  })),
              )}

              {config.syrupId !== 'sin-sirope' && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-[#D2AC79]/50 bg-[#D2AC79]/20 px-4 py-3">
                  <span className="text-xs font-medium text-[#422E24]">
                    Intensidad de sirope (pumps)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {([1, 2, 3] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, syrupPumps: level }))}
                        className={`rounded-md px-3 py-1 font-mono text-xs font-medium ${
                          config.syrupPumps === level
                            ? 'bg-[#122347] text-[#E5C36B]'
                            : 'border border-[#D2AC79]/50 bg-[#FAF5EE] text-[#422E24]'
                        }`}
                      >
                        {level}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderOptionGroup(
              'Toppings finales',
              '05',
              CUSTOM_TOPPINGS,
              config.toppingId,
              (toppingId) => setConfig((prev) => ({ ...prev, toppingId })),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
