import { Gift, Lock, Sparkles, CheckCircle2, Unlock } from 'lucide-react';
import { LOYALTY_REWARDS, LOYALTY_TIERS } from '../data/coffeaData';
import type {
  CustomerProfile,
  LoyaltyReward,
  LoyaltyTier,
  OrderRecord,
} from '../types/coffea';
import { getOrderStatusLabel } from '../utils/orderStatus';
import { MediaCrop } from './MediaCrop';

interface LoyaltySectionProps {
  customer: CustomerProfile;
  currentTier: LoyaltyTier;
  orderHistory: OrderRecord[];
  onRedeemReward: (reward: LoyaltyReward) => void;
  onClaimBirthdayGift: () => void;
  onJumpToEarlyAccess: () => void;
}

export function LoyaltySection({
  customer,
  currentTier,
  orderHistory,
  onRedeemReward,
  onClaimBirthdayGift,
  onJumpToEarlyAccess,
}: LoyaltySectionProps) {
  const nextTierObj =
    currentTier === 'Bronce'
      ? LOYALTY_TIERS[1]
      : currentTier === 'Plata'
      ? LOYALTY_TIERS[2]
      : null;

  const progressPct = nextTierObj
    ? Math.min(100, Math.round((customer.lifetimePoints / nextTierObj.minPoints) * 100))
    : 100;

  const tierOrder: Record<LoyaltyTier, number> = { Bronce: 1, Plata: 2, Oro: 3 };
  const currentYear = 2026;
  const birthdayAlreadyClaimed = customer.birthdayClaimedYear === currentYear;

  return (
    <section
      id="club-lealtad"
      className="scroll-mt-20 border-b border-[#D2AC79]/45 bg-[#FAF5EE] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header & Points Ledger Card */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
              Sistema de Lealtad Club COFFEA
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-[#422E24] sm:text-4xl">
              Cada taza suma 1 punto por Q1 gastado
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#422E24]/80">
              Acumula puntos automáticamente en cada compra, sube entre niveles Bronce, Plata y Oro,
              canjea bebidas y postres gratis al instante y desbloquea cosechas anticipadas.
            </p>

            {/* 3 Tier Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {LOYALTY_TIERS.map((tierDef) => {
                const isCurrent = tierDef.tier === currentTier;
                return (
                  <div
                    key={tierDef.tier}
                    className={`flex flex-col justify-between rounded-xl border p-5 ${
                      isCurrent
                        ? 'border-[#122347] bg-[#122347]/[0.05]'
                        : 'border-[#D2AC79]/50 bg-[#D2AC79]/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xl font-medium text-[#422E24]">
                          {tierDef.tier}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#122347]">
                            Tu Nivel
                          </span>
                        )}
                      </div>
                      <p className="mt-1 font-mono text-xs tabular-nums text-[#422E24]/70">
                        {tierDef.maxPoints
                          ? `${tierDef.minPoints} – ${tierDef.maxPoints} pts`
                          : `${tierDef.minPoints}+ pts`}
                      </p>
                      <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[#422E24]/85">
                        {tierDef.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#122347]" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Membership Wallet Card */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-xl border border-[#E5C36B]/30 bg-[#122347] p-6 text-[#FAF5EE] shadow-md">
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#E5C36B]">
                      Membresía Digital COFFEA
                    </p>
                    <p className="mt-1 font-display text-2xl font-medium text-[#FAF5EE]">
                      {customer.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#FAF5EE]/65">Nivel</p>
                    <p className="font-display text-xl text-[#E5C36B]">{currentTier}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-[#FAF5EE]/75">Saldo disponible para canje</p>
                    <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-[#FAF5EE]">
                      {customer.points}{' '}
                      <span className="text-base font-normal text-[#E5C36B]">pts</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#FAF5EE]/65">Acumulado histórico</p>
                    <p className="mt-1 font-mono text-sm tabular-nums text-[#FAF5EE]/90">
                      {customer.lifetimePoints} pts
                    </p>
                  </div>
                </div>

                {/* Progress Bar to Next Tier */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-[#FAF5EE]/80">
                    <span>Progreso a {nextTierObj ? nextTierObj.tier : 'Nivel Máximo'}</span>
                    <span className="font-mono tabular-nums text-[#E5C36B]">
                      {nextTierObj
                        ? `${customer.lifetimePoints} / ${nextTierObj.minPoints} pts`
                        : 'Oro completo'}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-white/15">
                    <div
                      className="h-full rounded-sm bg-[#E5C36B] transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Birthday & Early Access Interactive Perks */}
              <div className="mt-6 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={birthdayAlreadyClaimed}
                  onClick={onClaimBirthdayGift}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                    birthdayAlreadyClaimed
                      ? 'border-white/10 bg-white/5 text-[#FAF5EE]/50'
                      : 'border-[#E5C36B]/55 bg-[#E5C36B]/15 text-[#FAF5EE] hover:bg-[#E5C36B]/25'
                  }`}
                >
                  <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C36B]" />
                  <div>
                    <p className="text-xs font-semibold">
                      {birthdayAlreadyClaimed ? 'Regalo de cumpleaños añadido' : 'Regalo de cumpleaños'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#FAF5EE]/75">
                      {birthdayAlreadyClaimed
                        ? 'Ya incluido en tu pedido'
                        : 'Reclamar cortesía de nivel'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onJumpToEarlyAccess}
                  className="flex items-start gap-3 rounded-lg border border-white/15 bg-white/5 p-3.5 text-left text-[#FAF5EE] transition-colors hover:bg-white/10"
                >
                  {currentTier === 'Bronce' ? (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C36B]" />
                  ) : (
                    <Unlock className="mt-0.5 h-4 w-4 shrink-0 text-[#E5C36B]" />
                  )}
                  <div>
                    <p className="text-xs font-semibold">Acceso Anticipado</p>
                    <p className="mt-0.5 text-[11px] text-[#FAF5EE]/75">
                      {currentTier === 'Bronce'
                        ? `A ${Math.max(0, 250 - customer.lifetimePoints)} pts de Micro-lotes`
                        : 'Micro-lotes desbloqueados'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Redeemable Rewards Grid */}
        <div className="mt-12 border-t border-[#D2AC79]/40 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-2xl font-medium text-[#422E24]">
                Recompensas canjeables al instante
              </h3>
              <p className="mt-1 text-sm text-[#422E24]/75">
                Canjea tus puntos y el producto entra directo a tu carrito en Q0.00.
              </p>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-[#122347]">
              Disponibles: {customer.points} pts
            </span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {LOYALTY_REWARDS.map((reward) => {
              const tierUnlocked = tierOrder[currentTier] >= tierOrder[reward.minTier];
              const enoughPoints = customer.points >= reward.costPoints;
              const canRedeem = tierUnlocked && enoughPoints;

              return (
                <article
                  key={reward.id}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#D2AC79]/50 bg-[#EFE3D5]/55"
                >
                  <div>
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFE3D5]">
                      <MediaCrop
                        src={reward.photo}
                        alt={reward.title}
                        photoX={reward.photoX}
                        photoY={reward.photoY}
                        photoSize={reward.photoSize}
                        isAtlas={Boolean(reward.photoSize)}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-mono text-xs font-semibold tabular-nums text-[#122347]">
                        {reward.costPoints} pts · Nivel {reward.minTier}+
                      </p>
                      <h4 className="mt-1 text-sm font-semibold text-[#422E24]">
                        {reward.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#422E24]/70">{reward.subtitle}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#D2AC79]/40 bg-[#FAF5EE] p-3.5">
                    <button
                      type="button"
                      disabled={!canRedeem}
                      onClick={() => onRedeemReward(reward)}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        canRedeem
                          ? 'bg-[#122347] text-[#FAF5EE] hover:bg-[#1B3363]'
                          : 'cursor-not-allowed bg-[#D2AC79]/30 text-[#422E24]/55'
                      }`}
                    >
                      <Sparkles className={`h-3.5 w-3.5 ${canRedeem ? 'text-[#E5C36B]' : ''}`} />
                      <span>
                        {!tierUnlocked
                          ? `Requiere ${reward.minTier}`
                          : !enoughPoints
                          ? `Faltan ${reward.costPoints - customer.points} pts`
                          : 'Canjear por Q0.00'}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Order & Points History Table */}
        <div className="mt-12 border-t border-[#D2AC79]/40 pt-10">
          <h3 className="font-display text-2xl font-medium text-[#422E24]">
            Historial de pedidos y puntos
          </h3>
          <p className="mt-1 text-sm text-[#422E24]/75">
            Tus últimos pedidos alimentan automáticamente el motor de Perfect Pairing.
          </p>

          <div className="mt-5 overflow-x-auto rounded-xl border border-[#D2AC79]/50">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-[#D2AC79]/50 bg-[#EFE3D5] text-[11px] uppercase tracking-[0.12em] text-[#422E24]/75">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Detalle</th>
                  <th className="px-4 py-3 font-semibold">Modalidad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2AC79]/35 bg-[#FAF5EE]">
                {orderHistory.slice(0, 6).map((ord) => (
                  <tr key={ord.id}>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-[#422E24]">
                      #{ord.id}
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]">
                      {ord.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#422E24]/70">
                      {ord.deliveryType === 'apartamento'
                        ? `Modra · ${ord.apartment}`
                        : 'Retiro en barra'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-[#122347]">
                      {getOrderStatusLabel(ord.status, ord.deliveryType)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-medium tabular-nums text-[#422E24]">
                      Q{ord.totalPaid.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-semibold tabular-nums text-[#122347]">
                      +{ord.pointsEarned} pts
                      {ord.pointsSpent > 0 ? ` / −${ord.pointsSpent}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
