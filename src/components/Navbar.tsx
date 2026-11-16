import { Bell, ShoppingBag, Coffee, SlidersHorizontal } from 'lucide-react';
import type { LoyaltyTier } from '../types/coffea';

export type ActiveWorkspace = 'storefront' | 'operations';

interface NavbarProps {
  workspace: ActiveWorkspace;
  onChangeWorkspace: (ws: ActiveWorkspace) => void;
  cartCount: number;
  onOpenCart: () => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  userTier: LoyaltyTier;
  userPoints: number;
}

export function Navbar({
  workspace,
  onChangeWorkspace,
  cartCount,
  onOpenCart,
  unreadNotifications,
  onOpenNotifications,
  userTier,
  userPoints,
}: NavbarProps) {
  const scrollToSection = (sectionId: string) => {
    if (workspace !== 'storefront') {
      onChangeWorkspace('storefront');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D2AC79]/45 bg-[#EFE3D5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            onChangeWorkspace('storefront');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-left focus:outline-none"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#122347] text-[#E5C36B]">
            <Coffee className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="font-display text-xl font-medium tracking-[0.14em] text-[#422E24]">
            COFFEA
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          <button
            type="button"
            onClick={() => scrollToSection('tour-sistema')}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[#122347] transition-colors hover:text-[#422E24]"
          >
            Cómo funciona
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('perfect-pairing')}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[#422E24]/80 transition-colors hover:text-[#422E24]"
          >
            Perfect Pairing
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('carta')}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[#422E24]/80 transition-colors hover:text-[#422E24]"
          >
            Carta
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('barista-studio')}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[#422E24]/80 transition-colors hover:text-[#422E24]"
          >
            Barista Studio
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('club-lealtad')}
            className="shrink-0 whitespace-nowrap text-[13px] font-medium text-[#422E24]/80 transition-colors hover:text-[#422E24]"
          >
            Club · {userTier} ({userPoints} pts)
          </button>
          <button
            type="button"
            onClick={() => onChangeWorkspace(workspace === 'operations' ? 'storefront' : 'operations')}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b pb-0.5 text-[13px] font-medium transition-colors ${
              workspace === 'operations'
                ? 'border-[#122347] text-[#122347]'
                : 'border-transparent text-[#422E24]/80 hover:text-[#422E24]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {workspace === 'operations' ? 'Volver a Carta' : 'Operaciones'}
          </button>
        </nav>

        {/* Zone 3: Alerts & Primary Order Action */}
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChangeWorkspace(workspace === 'operations' ? 'storefront' : 'operations')}
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-2.5 py-2 text-xs font-medium text-[#422E24] md:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {workspace === 'operations' ? 'Carta' : 'Panel'}
          </button>
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Alertas de pedidos"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-3 py-2 text-[13px] font-medium text-[#422E24] transition-colors hover:border-[#122347]"
          >
            <Bell
              className={`h-4 w-4 ${unreadNotifications > 0 ? 'text-[#122347]' : 'text-[#422E24]/75'}`}
              strokeWidth={1.75}
            />
            <span className="hidden sm:inline">Alertas</span>
            {unreadNotifications > 0 && (
              <span className="font-mono text-xs font-semibold tabular-nums text-[#122347]">
                {unreadNotifications}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg bg-[#122347] px-4 py-2 text-[13px] font-medium text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
          >
            <ShoppingBag className="h-4 w-4 text-[#E5C36B]" strokeWidth={1.75} />
            <span>Tu Pedido</span>
            <span className="font-mono tabular-nums text-[#E5C36B]">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
