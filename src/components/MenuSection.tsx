import { useMemo, useState } from 'react';
import { Lock, Plus, Search, Sliders, X } from 'lucide-react';
import type { FlavorTag, LoyaltyTier, MenuCategory, MenuItem } from '../types/coffea';
import { MediaCrop } from './MediaCrop';

interface MenuSectionProps {
  menu: MenuItem[];
  userTier: LoyaltyTier;
  onAddMenuItem: (item: MenuItem, milkChoice?: 'Entera' | 'Deslactosada' | 'Almendra' | 'Avena') => void;
  onCustomizeInStudio: (item: MenuItem) => void;
  onJumpToLoyalty: () => void;
}

const CATEGORIES: MenuCategory[] = [
  'Todo',
  'Espresso bar',
  'Métodos de café',
  'Té & Cacao',
  'Bebidas Frías',
  'Empanadas & Sándwiches',
  'Postres',
  'Café en bolsa',
  'Edición Anticipada',
];

const FLAVOR_FILTERS: { tag: FlavorTag; label: string }[] = [
  { tag: 'cítrico', label: 'Cítrico' },
  { tag: 'chocolate', label: 'Chocolate' },
  { tag: 'floral', label: 'Floral' },
  { tag: 'intenso', label: 'Intenso' },
  { tag: 'cremoso', label: 'Cremoso' },
  { tag: 'dulce', label: 'Dulce' },
  { tag: 'especiado', label: 'Especiado' },
  { tag: 'frutal', label: 'Frutal' },
  { tag: 'refrescante', label: 'Refrescante' },
  { tag: 'botánico', label: 'Botánico' },
  { tag: 'salado', label: 'Salado' },
  { tag: 'cacao', label: 'Cacao' },
];

type MilkOption = 'Entera' | 'Deslactosada' | 'Avena' | 'Almendra';

export function MenuSection({
  menu,
  userTier,
  onAddMenuItem,
  onCustomizeInStudio,
  onJumpToLoyalty,
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMilk, setSelectedMilk] = useState<MilkOption>('Entera');
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorTag[]>([]);

  const isFreeAltMilk = userTier === 'Plata' || userTier === 'Oro';

  const hasTierAccess = (required?: 'Plata' | 'Oro') => {
    if (!required) return true;
    if (required === 'Plata') return userTier === 'Plata' || userTier === 'Oro';
    return userTier === 'Oro';
  };

  const baseFilteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menu.filter((item) => {
      const matchesCat =
        activeCategory === 'Todo'
          ? true
          : activeCategory === 'Edición Anticipada'
          ? Boolean(item.earlyAccessTier)
          : item.category === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q) ||
        item.flavorTags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  const filteredItems = useMemo(() => {
    if (selectedFlavors.length === 0) return baseFilteredItems;
    return baseFilteredItems.filter((item) =>
      selectedFlavors.every((tag) => item.flavorTags.includes(tag)),
    );
  }, [baseFilteredItems, selectedFlavors]);

  const flavorCounts = useMemo(() => {
    const counts: Partial<Record<FlavorTag, number>> = {};
    for (const { tag } of FLAVOR_FILTERS) {
      counts[tag] = baseFilteredItems.filter(
        (item) =>
          item.flavorTags.includes(tag) &&
          selectedFlavors.every((activeTag) => activeTag === tag || item.flavorTags.includes(activeTag)),
      ).length;
    }
    return counts;
  }, [baseFilteredItems, selectedFlavors]);

  const toggleFlavorTag = (tag: FlavorTag) => {
    setSelectedFlavors((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const resetAllFilters = () => {
    setActiveCategory('Todo');
    setSearchQuery('');
    setSelectedFlavors([]);
  };

  const computeEffectivePrice = (item: MenuItem) => {
    const isAltMilk = selectedMilk === 'Avena' || selectedMilk === 'Almendra';
    if (item.milkEligible && isAltMilk && !isFreeAltMilk) {
      return item.price + 5;
    }
    return item.price;
  };

  return (
    <section id="carta" className="scroll-mt-20 border-b border-[#D2AC79]/40 bg-[#FAF5EE] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
              Carta Completa · Precios en Quetzales
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-[#422E24] sm:text-4xl">
              Café, cacao, métodos y repostería
            </h2>
            <p className="mt-2 text-sm text-[#422E24]/80">
              Promoción activa: 3 empanadas a elección por Q55.00 en automático al agregar al pedido.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#422E24]/60" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar espresso, cítrico, matcha..."
                aria-label="Buscar en la carta de COFFEA"
                className="w-full rounded-lg border border-[#D2AC79]/60 bg-white py-2.5 pl-10 pr-4 text-sm text-[#422E24] placeholder-[#422E24]/50 focus:border-[#122347] focus:outline-none sm:w-72"
              />
            </div>
          </div>
        </div>

        {/* Milk Selector & Category Filter Bar */}
        <div className="mt-7 flex flex-col gap-4 border-t border-[#D2AC79]/40 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#122347] text-[#FAF5EE]'
                    : 'bg-[#EFE3D5]/70 text-[#422E24] hover:bg-[#D2AC79]/35'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-[#422E24]/75">Leche en bebidas:</span>
            {(['Entera', 'Deslactosada', 'Avena', 'Almendra'] as MilkOption[]).map((milk) => {
              const isAlt = milk === 'Avena' || milk === 'Almendra';
              return (
                <button
                  key={milk}
                  type="button"
                  onClick={() => setSelectedMilk(milk)}
                  className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 font-medium transition-colors ${
                    selectedMilk === milk
                      ? 'border-[#122347] bg-[#122347] text-[#FAF5EE]'
                      : 'border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24] hover:border-[#122347]'
                  }`}
                >
                  {milk}
                  {isAlt ? (isFreeAltMilk ? ' · Gratis' : ' +Q5') : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flavor-Tag Filter Bar */}
        <div
          aria-label="Filtros por perfil de sabor"
          className="border-y border-[#D2AC79]/40 bg-[#EFE3D5]/45 px-4 py-3.5 rounded-lg"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#422E24]/80">
                Notas de sabor:
              </span>
              <button
                type="button"
                onClick={() => setSelectedFlavors([])}
                aria-pressed={selectedFlavors.length === 0}
                className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedFlavors.length === 0
                    ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                    : 'border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24] hover:border-[#122347]'
                }`}
              >
                Todos ({baseFilteredItems.length})
              </button>

              {FLAVOR_FILTERS.map(({ tag, label }) => {
                const isSelected = selectedFlavors.includes(tag);
                const count = flavorCounts[tag] ?? 0;
                const isDisabled = !isSelected && count === 0;

                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleFlavorTag(tag)}
                    aria-pressed={isSelected}
                    className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                        : isDisabled
                        ? 'cursor-not-allowed border-[#D2AC79]/30 bg-[#FAF5EE]/50 text-[#422E24]/35'
                        : 'border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24] hover:border-[#122347] hover:bg-[#FAF5EE]'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`ml-1.5 font-mono text-[11px] tabular-nums ${
                        isSelected ? 'text-[#FAF5EE]/85' : 'text-[#422E24]/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 text-xs sm:justify-end">
              <span className="font-mono tabular-nums text-[#422E24]/75">
                {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'}
              </span>
              {selectedFlavors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFlavors([])}
                  className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md border border-[#122347]/25 bg-[#FAF5EE] px-2.5 py-1 font-medium text-[#122347] transition-colors hover:border-[#122347]"
                >
                  <X className="h-3 w-3" />
                  <span>Limpiar sabores</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const unlocked = hasTierAccess(item.earlyAccessTier);
            const effectivePrice = computeEffectivePrice(item);

            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#D2AC79]/50 bg-[#EFE3D5]/35 transition-colors hover:border-[#D2AC79]"
              >
                <div>
                  {/* Exclusive 5-tone origin/process bar ONLY for coffee origins, processes, or varieties */}
                  {item.originCode && (
                    <div
                      className="h-1 w-full"
                      style={{ backgroundColor: item.originCode.hex }}
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative aspect-square w-full overflow-hidden bg-[#EFE3D5]">
                    <MediaCrop
                      src={item.photo}
                      alt={item.name}
                      photoX={item.photoX}
                      photoY={item.photoY}
                      photoSize={item.photoSize}
                      objectFit={item.objectFit}
                      isAtlas={item.isAtlas}
                      className="h-full w-full group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-5">
                    {item.originCode ? (
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#422E24]/80">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.originCode.hex }}
                          aria-hidden="true"
                        />
                        <span>
                          {item.originCode.tone} · {item.originCode.label}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#422E24]/70">
                        {item.category} · {item.subCategory}
                        {item.earlyAccessTier ? ` · Exclusivo ${item.earlyAccessTier}` : ''}
                      </p>
                    )}

                    <h3 className="mt-1.5 font-display text-xl font-medium text-[#422E24]">
                      {item.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#422E24]/80">
                      {item.description}
                    </p>
                    <p className="mt-2.5 text-[11px] uppercase tracking-[0.1em] text-[#422E24]/70">
                      {item.flavorTags.map((tag, idx) => {
                        const matched = selectedFlavors.includes(tag);
                        return (
                          <span key={tag}>
                            {idx > 0 && <span className="mx-1.5 text-[#D2AC79]">·</span>}
                            <span className={matched ? 'font-semibold text-[#122347]' : ''}>
                              {tag}
                            </span>
                          </span>
                        );
                      })}
                    </p>
                    {item.earlyAccessTier && (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#122347]">
                        Edición Especial · Nivel {item.earlyAccessTier}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#D2AC79]/40 bg-[#FAF5EE] px-5 py-3.5">
                  <div>
                    <span className="font-mono text-lg font-semibold tabular-nums text-[#422E24]">
                      Q{effectivePrice.toFixed(2)}
                    </span>
                    {item.milkEligible && (selectedMilk === 'Avena' || selectedMilk === 'Almendra') && (
                      <span className="ml-2 text-[11px] font-medium text-[#122347]">
                        {selectedMilk}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.prepType === 'drink' && unlocked && (
                      <button
                        type="button"
                        onClick={() => onCustomizeInStudio(item)}
                        title="Personalizar en Barista Studio"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#D2AC79]/60 bg-[#EFE3D5]/55 px-2.5 py-2 text-xs font-medium text-[#422E24] transition-colors hover:border-[#122347]"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Studio</span>
                      </button>
                    )}

                    {unlocked ? (
                      <button
                        type="button"
                        onClick={() =>
                          onAddMenuItem(item, item.milkEligible ? selectedMilk : undefined)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#122347] px-3.5 py-2 text-xs font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                      >
                        <Plus className="h-3.5 w-3.5 text-[#E5C36B]" />
                        <span>Agregar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onJumpToLoyalty}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5C36B] bg-[#122347] px-3 py-2 text-xs font-semibold text-[#E5C36B] transition-colors hover:bg-[#1B3363]"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Nivel {item.earlyAccessTier}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="mt-10 rounded-xl border border-[#D2AC79]/50 bg-[#EFE3D5]/50 py-14 text-center">
            <p className="font-display text-xl text-[#422E24]">Sin coincidencias en la carta</p>
            <p className="mt-1 text-sm text-[#422E24]/75">
              Prueba otra categoría, limpia los filtros de sabor o cambia el término de búsqueda.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 rounded-lg bg-[#122347] px-4 py-2 text-xs font-semibold text-[#FAF5EE]"
            >
              Ver toda la carta
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
