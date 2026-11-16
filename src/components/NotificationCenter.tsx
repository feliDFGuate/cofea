import {
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  Coffee,
  PackageCheck,
  Play,
  Pause,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { OrderNotification, OrderRecord, OrderStatus } from '../types/coffea';
import { getNextOrderStatus, getOrderStatusLabel } from '../utils/orderStatus';

interface LiveNotificationBannerProps {
  alert: OrderNotification | null;
  onDismiss: () => void;
  onOpenCenter: () => void;
}

export function LiveNotificationBanner({
  alert,
  onDismiss,
  onOpenCenter,
}: LiveNotificationBannerProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border p-4 shadow-xl ${
            alert.status === 'Listo'
              ? 'border-[#E5C36B]/55 bg-[#122347] text-[#FAF5EE]'
              : 'border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24]'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                alert.status === 'Listo'
                  ? 'bg-[#E5C36B] text-[#122347]'
                  : alert.status === 'Preparando'
                  ? 'bg-[#D2AC79]/35 text-[#422E24]'
                  : 'bg-[#122347]/10 text-[#122347]'
              }`}
            >
              {alert.status === 'Listo' ? (
                <PackageCheck className="h-4 w-4" />
              ) : alert.status === 'Preparando' ? (
                <Coffee className="h-4 w-4" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    alert.status === 'Listo'
                      ? 'text-[#E5C36B]'
                      : alert.status === 'Preparando'
                      ? 'text-[#422E24]'
                      : 'text-[#122347]'
                  }`}
                >
                  {getOrderStatusLabel(alert.status, alert.deliveryType)} · Barra COFFEA
                </p>
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Cerrar alerta"
                  className={`rounded p-0.5 transition-colors ${
                    alert.status === 'Listo'
                      ? 'text-[#FAF5EE]/75 hover:text-[#FAF5EE]'
                      : 'text-[#422E24]/55 hover:text-[#422E24]'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-sm font-semibold leading-snug">{alert.title}</p>
              <p
                className={`mt-1 text-xs leading-relaxed ${
                  alert.status === 'Listo' ? 'text-[#FAF5EE]/85' : 'text-[#422E24]/80'
                }`}
              >
                {alert.message}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onDismiss();
                    onOpenCenter();
                  }}
                  className={`text-xs font-semibold underline-offset-4 hover:underline ${
                    alert.status === 'Listo' ? 'text-[#E5C36B]' : 'text-[#122347]'
                  }`}
                >
                  Ver seguimiento en vivo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: OrderNotification[];
  orders: OrderRecord[];
  autoSimulate: boolean;
  soundEnabled: boolean;
  onToggleAutoSimulate: () => void;
  onToggleSound: () => void;
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onTriggerSimulatedOrder: () => void;
  onMarkAllRead: () => void;
  onClearNotifications: () => void;
  onMarkRead: (id: string) => void;
}

const STEPPER_STEPS: OrderStatus[] = ['Recibido', 'Confirmado', 'Preparando', 'Listo'];

function formatShortTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Ahora';
  }
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  orders,
  autoSimulate,
  soundEnabled,
  onToggleAutoSimulate,
  onToggleSound,
  onAdvanceOrderStatus,
  onTriggerSimulatedOrder,
  onMarkAllRead,
  onClearNotifications,
  onMarkRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const activeOrder = orders.find((o) => o.status !== 'Entregado');
  const nextStatus = activeOrder ? getNextOrderStatus(activeOrder.status) : null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentStepIdx = activeOrder
    ? Math.max(0, STEPPER_STEPS.indexOf(activeOrder.status))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#122347]/45 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Centro de notificaciones de pedidos"
        className="flex h-full w-full max-w-md flex-col bg-[#EFE3D5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D2AC79]/50 bg-[#FAF5EE] px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#122347]" />
              <h2 className="font-display text-xl font-medium text-[#422E24]">
                Alertas de Pedido
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#422E24]/70">
              Simulación en vivo de estados en barra · Modra Zona 4
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar notificaciones"
            className="rounded-lg border border-[#D2AC79]/50 p-2 text-[#422E24]/75 hover:border-[#422E24] hover:text-[#422E24]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Simulation Controls */}
        <div className="border-b border-[#D2AC79]/45 bg-[#D2AC79]/25 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onToggleAutoSimulate}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                autoSimulate
                  ? 'border-[#122347] bg-[#122347] text-[#E5C36B]'
                  : 'border-[#D2AC79]/60 bg-[#FAF5EE] text-[#422E24]/80 hover:text-[#422E24]'
              }`}
            >
              {autoSimulate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{autoSimulate ? 'Simulación auto: ON' : 'Simulación auto: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-3 py-1.5 text-xs font-medium text-[#422E24]/80 transition-colors hover:text-[#422E24]"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-[#122347]" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-[#422E24]/50" />
              )}
              <span>{soundEnabled ? 'Sonido activo' : 'Silencio'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Active Order Live Stepper */}
          {activeOrder ? (
            <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#122347]">
                    Seguimiento en vivo · #{activeOrder.id}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#422E24]">
                    {getOrderStatusLabel(activeOrder.status, activeOrder.deliveryType)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#422E24]/70">
                    {activeOrder.deliveryType === 'apartamento'
                      ? `Modra ${activeOrder.apartment}`
                      : `Retiro en barra · ${activeOrder.pickupWindow}`}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-[#422E24]">
                  Q{activeOrder.totalPaid.toFixed(2)}
                </span>
              </div>

              {/* 4-Step Progress Bar */}
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-1.5">
                  {STEPPER_STEPS.map((step, idx) => {
                    const reached = idx <= currentStepIdx;
                    return (
                      <div key={step} className="space-y-1.5">
                        <div
                          className={`h-1.5 w-full rounded-sm transition-colors ${
                            reached ? 'bg-[#122347]' : 'bg-[#D2AC79]/35'
                          }`}
                        />
                        <p
                          className={`truncate text-[10px] font-medium ${
                            idx === currentStepIdx
                              ? 'text-[#122347]'
                              : reached
                              ? 'text-[#422E24]'
                              : 'text-[#422E24]/50'
                          }`}
                        >
                          {step === 'Preparando'
                            ? 'En prep.'
                            : step === 'Listo'
                            ? 'Listo'
                            : step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#D2AC79]/40 pt-3">
                <span className="truncate text-xs text-[#422E24]/70">
                  {activeOrder.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </span>
                {nextStatus && (
                  <button
                    type="button"
                    onClick={() => onAdvanceOrderStatus(activeOrder.id, nextStatus)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#122347] px-3 py-1.5 text-xs font-medium text-[#FAF5EE] transition-colors hover:bg-[#1B3363]"
                  >
                    <Sparkles className="h-3 w-3 text-[#E5C36B]" />
                    <span>
                      Simular: {getOrderStatusLabel(nextStatus, activeOrder.deliveryType)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#422E24]/70">
                Sin pedidos activos ahora
              </p>
              <p className="mt-1 text-sm text-[#422E24]">
                Genera un pedido simulado para probar alertas desde “Recibido” hasta “Listo para recoger”.
              </p>
              <button
                type="button"
                onClick={onTriggerSimulatedOrder}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#122347] px-3.5 py-2 text-xs font-medium text-[#FAF5EE] hover:bg-[#1B3363]"
              >
                <Coffee className="h-3.5 w-3.5 text-[#E5C36B]" />
                <span>Simular pedido rápido en barra</span>
              </button>
            </div>
          )}

          {/* Feed Actions */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#422E24]/80">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 font-medium text-[#122347] hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Marcar leídas</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearNotifications}
                  className="inline-flex items-center gap-1 text-[#422E24]/70 hover:text-[#DC2626]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] px-5 py-10 text-center">
              <Clock className="mx-auto h-7 w-7 text-[#422E24]/45" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-[#422E24]">
                No hay alertas registradas
              </p>
              <p className="mt-1 text-xs text-[#422E24]/70">
                Realiza un pedido desde la carta o simula uno arriba para recibir alertas en vivo.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D2AC79]/35 overflow-hidden rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE]">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => onMarkRead(notif.id)}
                  className={`block w-full px-4 py-3.5 text-left transition-colors hover:bg-[#EFE3D5]/55 ${
                    !notif.read ? 'bg-[#D2AC79]/20' : 'bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        notif.status === 'Listo'
                          ? 'text-[#122347]'
                          : notif.status === 'Preparando'
                          ? 'text-[#422E24]'
                          : 'text-[#422E24]/70'
                      }`}
                    >
                      {getOrderStatusLabel(notif.status, notif.deliveryType)}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-[#422E24]/60">
                      {formatShortTime(notif.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {!notif.read && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-xs bg-[#122347]"
                        aria-hidden="true"
                      />
                    )}
                    <p className="text-sm font-semibold text-[#422E24]">{notif.title}</p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#422E24]/80">{notif.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
