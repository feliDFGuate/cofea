import { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { MENU_ITEMS } from '../data/coffeaData';
import type { CartItem, CustomerProfile, LoyaltyTier, OrderRecord } from '../types/coffea';
import {
  analyzeCartPairings,
  type CartPairingAnalysis,
} from '../utils/recommendationEngine';
import { MediaCrop } from './MediaCrop';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  customer: CustomerProfile;
  currentTier: LoyaltyTier;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onApplyPairingComparison: (analysis: CartPairingAnalysis) => void;
  onCheckout: (details: {
    customerName: string;
    phone: string;
    deliveryType: 'retiro' | 'apartamento';
    apartment: string;
    pickupWindow: string;
    notes: string;
  }) => OrderRecord;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  customer,
  currentTier,
  onUpdateQty,
  onRemoveItem,
  onApplyPairingComparison,
  onCheckout,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [deliveryType, setDeliveryType] = useState<'retiro' | 'apartamento'>('apartamento');
  const [apartment, setApartment] = useState(customer.apartment);
  const [pickupWindow, setPickupWindow] = useState('Inmediato (10–15 min)');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  const empanadaCount = cart
    .filter((it) => it.kind === 'menu' && it.name.toLowerCase().includes('empanada'))
    .reduce((sum, it) => sum + it.quantity, 0);
  const empanadaPromoDiscount = Math.floor(empanadaCount / 3) * 5;

  const subtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const finalTotal = Math.max(0, subtotal - empanadaPromoDiscount);
  const pointsToEarn = Math.round(finalTotal);
  const pairingAnalysis = analyzeCartPairings(cart, MENU_ITEMS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const created = onCheckout({
      customerName: customerName.trim() || customer.name,
      phone: phone.trim() || customer.phone,
      deliveryType,
      apartment: deliveryType === 'apartamento' ? apartment.trim() || 'Lobby Modra' : '',
      pickupWindow,
      notes: notes.trim(),
    });
    setCompletedOrder(created);
    setNotes('');
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#122347]/45 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido en COFFEA"
        className="flex h-full w-full max-w-md flex-col bg-[#EFE3D5] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#D2AC79]/50 bg-[#FAF5EE] px-6 py-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-[#422E24]">Tu Pedido</h2>
            <p className="text-xs text-[#422E24]/70">
              Club {currentTier} · {customer.points} pts disponibles
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar carrito"
            className="rounded-lg border border-[#D2AC79]/50 p-2 text-[#422E24]/75 hover:border-[#422E24] hover:text-[#422E24]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {completedOrder ? (
            <div className="rounded-xl border border-[#122347]/30 bg-[#FAF5EE] p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#122347]" />
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#122347]">
                Comanda enviada a barra
              </p>
              <h3 className="mt-1 font-display text-2xl font-medium text-[#422E24]">
                Pedido #{completedOrder.id}
              </h3>
              <p className="mt-2 text-sm text-[#422E24]/80">
                {completedOrder.deliveryType === 'apartamento'
                  ? `Entrega en Modra · ${completedOrder.apartment}`
                  : `Retiro en barra · ${completedOrder.pickupWindow}`}
              </p>

              <div className="mt-5 space-y-2 border-y border-[#D2AC79]/40 py-4 text-left text-xs">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="text-[#422E24]">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-[#422E24]/75">
                      Q{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#422E24]">
                <span>Total a pagar al recibir</span>
                <span className="font-mono text-lg tabular-nums">
                  Q{completedOrder.totalPaid.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs font-medium text-[#122347]">
                +{completedOrder.pointsEarned} pts acreditados a tu cuenta · Alertas en vivo activadas
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="mt-6 w-full rounded-lg bg-[#122347] py-3 text-xs font-semibold text-[#FAF5EE] hover:bg-[#1B3363]"
              >
                Seguir en COFFEA
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-10 w-10 text-[#422E24]/50" strokeWidth={1.5} />
              <p className="mt-4 font-display text-xl text-[#422E24]">Tu pedido está vacío</p>
              <p className="mt-1 max-w-xs text-sm text-[#422E24]/70">
                Explora la carta, elige un Perfect Pairing o diseña una bebida en Barista Studio.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 rounded-lg bg-[#122347] px-5 py-2.5 text-xs font-semibold text-[#FAF5EE] hover:bg-[#1B3363]"
              >
                Explorar carta
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Line Items */}
              <div className="divide-y divide-[#D2AC79]/35 rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE]">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex items-start gap-3 p-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#EFE3D5]">
                      <MediaCrop
                        src={item.photo}
                        alt={item.name}
                        photoX={item.photoX}
                        photoY={item.photoY}
                        photoSize={item.photoSize}
                        isAtlas={Boolean(item.photoSize)}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#422E24]">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartKey)}
                          aria-label={`Quitar ${item.name}`}
                          className="text-[#422E24]/55 hover:text-[#DC2626]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-[#422E24]/70">{item.subtitle}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        {item.kind === 'reward' ? (
                          <span className="font-mono text-[11px] font-medium text-[#122347]">
                            Canje ({item.rewardPointsCost} pts)
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2 rounded-md border border-[#D2AC79]/50 bg-[#EFE3D5]/70 px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartKey, -1)}
                              aria-label="Disminuir cantidad"
                              className="p-1 text-[#422E24]/75 hover:text-[#422E24]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-mono text-xs font-semibold tabular-nums text-[#422E24]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartKey, 1)}
                              aria-label="Aumentar cantidad"
                              className="p-1 text-[#422E24]/75 hover:text-[#422E24]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        <span className="font-mono text-sm font-semibold tabular-nums text-[#422E24]">
                          {item.unitPrice === 0
                            ? 'Q0.00'
                            : `Q${(item.unitPrice * item.quantity).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Cost Comparison vs. Perfect Pairing */}
              {pairingAnalysis && (
                <div className="rounded-xl border border-[#122347]/25 bg-[#FAF5EE] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#122347]">
                        <Sparkles className="h-3 w-3 text-[#E5C36B]" />
                        <span>
                          {pairingAnalysis.mode === 'active'
                            ? 'Ahorro activo · Perfect Pairing'
                            : pairingAnalysis.mode === 'exact'
                            ? 'Mismo pedido como Perfect Pairing'
                            : 'Completa tu Perfect Pairing'}
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#422E24]">
                        {pairingAnalysis.pairing.headline}
                        {pairingAnalysis.matchedSets > 1
                          ? ` (×${pairingAnalysis.matchedSets})`
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#122347]">
                        −Q{pairingAnalysis.potentialSavings.toFixed(2)}
                      </span>
                      <p className="font-mono text-[10px] tabular-nums text-[#422E24]/75">
                        −
                        {Math.round(
                          (pairingAnalysis.potentialSavings /
                            pairingAnalysis.separateTotal) *
                            100,
                        )}
                        % ahorro
                      </p>
                    </div>
                  </div>

                  {/* Proportional Cost Bars */}
                  <div className="mt-3.5 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#422E24]/75">
                        <span>Ítems individuales por separado</span>
                        <span className="font-mono font-medium tabular-nums text-[#422E24]/80">
                          Q{pairingAnalysis.separateTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-sm bg-[#EFE3D5]">
                        <div className="h-full w-full bg-[#D2AC79]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-medium text-[#422E24]">
                        <span>Opción Perfect Pairing</span>
                        <span className="font-mono font-semibold tabular-nums text-[#122347]">
                          Q{pairingAnalysis.pairingTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1 flex h-4 w-full overflow-hidden rounded-sm bg-[#E5C36B]/30">
                        <div
                          className="h-full bg-[#122347] transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (pairingAnalysis.pairingTotal /
                                  pairingAnalysis.separateTotal) *
                                  100,
                              ),
                            )}%`,
                          }}
                        />
                        <div className="flex flex-1 items-center justify-center px-1 font-mono text-[9px] font-semibold tabular-nums text-[#422E24]">
                          −Q{pairingAnalysis.potentialSavings.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {pairingAnalysis.mode === 'exact' &&
                    finalTotal > pairingAnalysis.pairingTotal && (
                      <p className="mt-2.5 text-[11px] text-[#422E24]/75">
                        Total del pedido:{' '}
                        <span className="font-mono line-through">
                          Q{finalTotal.toFixed(2)}
                        </span>{' '}
                        <span className="font-mono font-semibold text-[#122347]">
                          Q{(finalTotal - pairingAnalysis.potentialSavings).toFixed(2)}
                        </span>
                      </p>
                    )}

                  {pairingAnalysis.mode === 'exact' && (
                    <button
                      type="button"
                      onClick={() => onApplyPairingComparison(pairingAnalysis)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#122347] px-3 py-2 text-xs font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#E5C36B]" />
                      <span>
                        Convertir a Perfect Pairing y ahorrar Q
                        {pairingAnalysis.potentialSavings.toFixed(2)}
                      </span>
                    </button>
                  )}

                  {pairingAnalysis.mode === 'partial' && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] text-[#422E24]/80">
                        Ya tienes <strong>{pairingAnalysis.presentItemName}</strong>. Súmalo con{' '}
                        <strong>{pairingAnalysis.missingItemName}</strong> en combo y ahorra Q
                        {pairingAnalysis.potentialSavings.toFixed(2)}.
                      </p>
                      <button
                        type="button"
                        onClick={() => onApplyPairingComparison(pairingAnalysis)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#122347] bg-[#EFE3D5]/70 px-3 py-2 text-xs font-semibold text-[#122347] transition-colors hover:bg-[#122347] hover:text-[#FAF5EE]"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#E5C36B]" />
                        <span>
                          Completar Perfect Pairing · Q
                          {pairingAnalysis.pairingTotal.toFixed(2)}
                        </span>
                      </button>
                    </div>
                  )}

                  {pairingAnalysis.mode === 'active' && (
                    <p className="mt-2.5 text-[11px] font-medium text-[#122347]">
                      Descuento Perfect Pairing aplicado automáticamente en tu pedido.
                    </p>
                  )}
                </div>
              )}

              {/* Totals Summary */}
              <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-4 text-sm">
                <div className="flex justify-between text-[#422E24]/80">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">Q{subtotal.toFixed(2)}</span>
                </div>
                {empanadaPromoDiscount > 0 && (
                  <div className="mt-1.5 flex justify-between text-[#122347]">
                    <span>Promoción 3 empanadas x Q55</span>
                    <span className="font-mono tabular-nums">
                      −Q{empanadaPromoDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex items-baseline justify-between border-t border-[#D2AC79]/40 pt-3 font-semibold text-[#422E24]">
                  <span>Total</span>
                  <span className="font-mono text-xl tabular-nums">Q{finalTotal.toFixed(2)}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-[#122347]">
                  Sumarás +{pointsToEarn} pts Club COFFEA con este pedido (1 pt por Q1)
                </p>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#422E24]">
                  Entrega y confirmación
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('apartamento')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                      deliveryType === 'apartamento'
                        ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                        : 'border-[#D2AC79]/50 bg-[#EFE3D5]/60 text-[#422E24]/80'
                    }`}
                  >
                    Entrega en Modra
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retiro')}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                      deliveryType === 'retiro'
                        ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                        : 'border-[#D2AC79]/50 bg-[#EFE3D5]/60 text-[#422E24]/80'
                    }`}
                  >
                    Retiro en barra
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#422E24]/80">Nombre</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-3 py-2 text-sm text-[#422E24]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#422E24]/80">Teléfono</label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-3 py-2 text-sm text-[#422E24]"
                    />
                  </div>
                  {deliveryType === 'apartamento' ? (
                    <div>
                      <label className="block text-xs font-medium text-[#422E24]/80">
                        Apartamento
                      </label>
                      <input
                        required
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Ej. Apto. 804"
                        className="mt-1 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-3 py-2 text-sm text-[#422E24]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-[#422E24]/80">
                        Horario retiro
                      </label>
                      <select
                        value={pickupWindow}
                        onChange={(e) => setPickupWindow(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-2.5 py-2 text-sm text-[#422E24]"
                      >
                        <option>Inmediato (10–15 min)</option>
                        <option>En 30 minutos</option>
                        <option>En 1 hora</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#422E24]/80">
                    Notas para barista
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Temperatura extra caliente, poco hielo..."
                    className="mt-1 w-full rounded-lg border border-[#D2AC79]/50 bg-[#EFE3D5]/45 px-3 py-2 text-sm text-[#422E24]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#122347] py-3.5 text-sm font-semibold text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                >
                  Confirmar pedido · Q{finalTotal.toFixed(2)}
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
