import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Check,
  ClipboardList,
  Download,
  Minus,
  Package,
  Plus,
} from 'lucide-react';
import { MEDIA_ASSETS } from '../data/coffeaData';
import type { InventoryItem, OrderRecord, OrderStatus } from '../types/coffea';
import { downloadOrdersCsv } from '../utils/csvExport';
import { getOrderStatusLabel } from '../utils/orderStatus';
import { HourlyDemandChart } from './HourlyDemandChart';
import { InventoryStockChart } from './InventoryStockChart';

interface OperationsViewProps {
  orders: OrderRecord[];
  inventory: InventoryItem[];
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onRestockItem: (itemId: string, amount: number) => void;
  onSimulateShiftConsumption: () => void;
  onBackToStorefront: () => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  Recibido: { next: 'Confirmado', label: 'Confirmar comanda' },
  Confirmado: { next: 'Preparando', label: 'Iniciar preparación' },
  Preparando: { next: 'Listo', label: 'Marcar listo' },
  Listo: { next: 'Entregado', label: 'Entregar pedido' },
};

export function OperationsView({
  orders,
  inventory,
  onAdvanceOrderStatus,
  onRestockItem,
  onSimulateShiftConsumption,
  onBackToStorefront,
}: OperationsViewProps) {
  const [tab, setTab] = useState<'comandas' | 'inventario' | 'cotizador'>('comandas');
  const [csvExported, setCsvExported] = useState(false);

  // Event & Catering Quote Estimator State
  const [guests, setGuests] = useState(40);
  const [barType, setBarType] = useState<'espresso' | 'metodos' | 'completo'>('espresso');
  const [includePastries, setIncludePastries] = useState(true);
  const [quoteSent, setQuoteSent] = useState(false);

  useEffect(() => {
    if (!csvExported) return;
    const timer = window.setTimeout(() => setCsvExported(false), 2500);
    return () => window.clearTimeout(timer);
  }, [csvExported]);

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    downloadOrdersCsv(orders);
    setCsvExported(true);
  };

  const perGuestBase = barType === 'espresso' ? 38 : barType === 'metodos' ? 48 : 65;
  const pastryCost = includePastries ? 28 : 0;
  const baristaFee = 450;
  const estimatedQuote = guests * (perGuestBase + pastryCost) + baristaFee;

  const activeOrders = orders.filter((o) => o.status !== 'Entregado');
  const lowStockCount = inventory.filter((i) => i.stock < i.minStock).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#D2AC79]/50 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
            COFFEA · Consola Operativa & Cotizaciones
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium text-[#422E24]">
            Comandas en Barra, Inventario y Eventos
          </h1>
          <p className="mt-1 text-sm text-[#422E24]/80">
            Sincronizado en tiempo real con cada pedido realizado desde la carta pública.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={orders.length === 0}
            aria-label={`Exportar historial de ${orders.length} pedidos a archivo CSV`}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#122347] px-4 py-2.5 text-xs font-semibold text-[#E5C36B] transition-colors hover:bg-[#1B3363] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {csvExported ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>CSV exportado ({orders.length})</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Exportar pedidos CSV ({orders.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToStorefront}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#D2AC79]/60 bg-[#FAF5EE] px-4 py-2.5 text-xs font-semibold text-[#422E24] hover:border-[#122347] hover:text-[#122347]"
          >
            <span>Volver a la carta pública</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('comandas')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'comandas'
              ? 'bg-[#122347] text-[#E5C36B]'
              : 'border border-[#D2AC79]/55 bg-[#FAF5EE] text-[#422E24]/80 hover:text-[#422E24]'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Comandas en Barra ({activeOrders.length} activas)</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('inventario')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'inventario'
              ? 'bg-[#122347] text-[#E5C36B]'
              : 'border border-[#D2AC79]/55 bg-[#FAF5EE] text-[#422E24]/80 hover:text-[#422E24]'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Inventario de Insumos ({lowStockCount} por reponer)</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('cotizador')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
            tab === 'cotizador'
              ? 'bg-[#122347] text-[#E5C36B]'
              : 'border border-[#D2AC79]/55 bg-[#FAF5EE] text-[#422E24]/80 hover:text-[#422E24]'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Cotización Comercial & Eventos</span>
        </button>
      </div>

      {/* Tab 1: Comandas */}
      {tab === 'comandas' && (
        <div className="mt-8 space-y-5">
          {lowStockCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DC2626]/25 bg-[#FEF2F2] px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-[#991B1B]">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                <span>
                  <strong>{lowStockCount} insumos</strong> por debajo de su umbral crítico en barra.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTab('inventario')}
                className="font-semibold text-[#DC2626] underline-offset-4 hover:underline"
              >
                Ver gráfico de stock →
              </button>
            </div>
          )}

          <HourlyDemandChart orders={orders} />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const action = NEXT_STATUS[order.status];
            return (
              <article
                key={order.id}
                className="flex flex-col justify-between rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-5"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#D2AC79]/40 pb-3">
                    <span className="font-mono text-base font-semibold text-[#422E24]">
                      #{order.id}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#122347]">
                      {getOrderStatusLabel(order.status, order.deliveryType)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#422E24]">{order.customerName}</p>
                  <p className="text-xs text-[#422E24]/70">
                    {order.deliveryType === 'apartamento'
                      ? `Entrega Modra · ${order.apartment}`
                      : `Retiro en barra · ${order.pickupWindow}`}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-[#D2AC79]/35 pt-3 text-xs text-[#422E24]">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-mono tabular-nums text-[#422E24]/70">
                          Q{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mt-3 rounded-lg bg-[#D2AC79]/20 p-2.5 text-xs text-[#422E24]/85">
                      Nota: {order.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#D2AC79]/40 pt-4">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#422E24]">
                    Q{order.totalPaid.toFixed(2)}
                  </span>
                  {action ? (
                    <button
                      type="button"
                      onClick={() => onAdvanceOrderStatus(order.id, action.next)}
                      className="rounded-lg bg-[#122347] px-3.5 py-2 text-xs font-medium text-[#FAF5EE] hover:bg-[#1B3363]"
                    >
                      {action.label}
                    </button>
                  ) : (
                    <span className="text-xs text-[#422E24]/65">Completado</span>
                  )}
                </div>
              </article>
            );
          })}
          </div>
        </div>
      )}

      {/* Tab 2: Inventario */}
      {tab === 'inventario' && (
        <div className="mt-8 space-y-6">
          <InventoryStockChart
            inventory={inventory}
            onAdjustStock={onRestockItem}
            onSimulateShiftConsumption={onSimulateShiftConsumption}
          />

          <div className="overflow-x-auto rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-[#D2AC79]/50 bg-[#EFE3D5] text-[11px] uppercase tracking-[0.12em] text-[#422E24]/75">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Insumo</th>
                  <th className="px-5 py-3.5 font-semibold">Existencia</th>
                  <th className="px-5 py-3.5 font-semibold">Umbral crítico</th>
                  <th className="px-5 py-3.5 font-semibold">Estado</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Ajuste rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D2AC79]/35">
                {inventory.map((item) => {
                  const isLow = item.stock < item.minStock;
                  const restockAmount = item.unit === 'unidad' ? 10 : 500;
                  const consumeAmount = item.unit === 'unidad' ? 2 : 250;
                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5 font-medium text-[#422E24]">{item.name}</td>
                      <td
                        className={`px-5 py-3.5 font-mono text-xs font-semibold tabular-nums ${
                          isLow ? 'text-[#DC2626]' : 'text-[#422E24]'
                        }`}
                      >
                        {item.stock.toLocaleString('es-GT')} {item.unit}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-[#422E24]/70">
                        {item.minStock.toLocaleString('es-GT')} {item.unit}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold">
                        <span className={isLow ? 'text-[#DC2626]' : 'text-[#122347]'}>
                          {isLow ? 'Bajo umbral crítico' : 'Óptimo'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={item.stock === 0}
                            onClick={() => onRestockItem(item.id, -consumeAmount)}
                            title={`Descontar ${consumeAmount} ${item.unit}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D2AC79]/55 bg-[#FAF5EE] px-2.5 py-1.5 font-mono text-xs font-medium text-[#422E24]/80 hover:border-[#422E24] hover:text-[#422E24] disabled:opacity-40"
                          >
                            <Minus className="h-3 w-3" />
                            <span>
                              {consumeAmount} {item.unit}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRestockItem(item.id, restockAmount)}
                            title={`Reponer ${restockAmount} ${item.unit}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D2AC79]/55 bg-[#D2AC79]/25 px-2.5 py-1.5 font-mono text-xs font-medium text-[#422E24] hover:border-[#122347]"
                          >
                            <Plus className="h-3 w-3" />
                            <span>
                              {restockAmount} {item.unit}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Cotización Comercial, Eventos & Billeteras */}
      {tab === 'cotizador' && (
        <div className="mt-8 space-y-8">
          {/* Propuesta Comercial Media Fusion Online -> COFFEA */}
          <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#D2AC79]/40 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#122347]">
                  Media Fusion Online · Propuesta Comercial
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-medium text-[#422E24] sm:text-3xl">
                  Cotización para COFFEA · Cafés Especiales
                </h2>
                <p className="mt-1 text-sm text-[#422E24]/80">
                  Modra, Zona 4 · Cada servicio tiene su precio individual de implementación o paquete integral.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#422E24]/70">Paquete completo de contado</p>
                <p className="font-mono text-2xl font-semibold tabular-nums text-[#122347]">
                  Q24,000
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#122347] text-[11px] uppercase tracking-[0.12em] text-[#E5C36B]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Servicio</th>
                    <th className="px-4 py-3 font-semibold">Qué incluye</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D2AC79]/35">
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Página web y carta digital
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Diseño móvil y escritorio, portada con video, carta interactiva completa, fotografías de estudio y carrito.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q4,500
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Sistema de pedidos y cobros en línea
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Recepción de pedidos, comandas de barra, inventario por receta, entrega en Modra o retiro e integración de cobro.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q8,500
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Perfect Pairing & Barista Studio
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Recomendaciones inteligentes según historial y tendencias + creador interactivo de bebidas guardadas en perfil.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q5,500
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Sistema de puntos y recompensas
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Niveles Bronce, Plata y Oro (1 pt/Q1), canjes directos, cumpleaños y acceso anticipado. Bonificado al contratar sistema de pedidos.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono tabular-nums">
                      <span className="mr-2 text-xs text-[#422E24]/55 line-through">Q2,500</span>
                      <span className="font-semibold text-[#122347]">GRATIS</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Tarjeta de menú para iPhone (Apple Wallet)
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Diseño y configuración en Apple Wallet y botón para guardar la tarjeta desde la carta pública.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q1,800
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Tarjeta de menú para Android (Google Wallet)
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Diseño y configuración en Google Wallet y acceso directo desde la carta pública.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q1,500
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3.5 font-semibold text-[#422E24]">
                      Paquete para iPhone y Android + QR
                    </td>
                    <td className="px-4 py-3.5 text-[#422E24]/80">
                      Ambas tarjetas y QR para mesas y caja que abre la carta pública al instante.
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-[#422E24]">
                      Q2,800
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tres formas de pago del paquete completo */}
            <div className="mt-8 rounded-xl border border-[#D2AC79]/60 bg-[#D2AC79]/20 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#122347]">
                    Tres formas de pago · Paquete Completo COFFEA
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#422E24]/85">
                    Incluye página y carta digital, sistema de pedidos, caja, comandas de cocina,
                    inventario por receta, mermas, reportes, Perfect Pairing, Barista Studio, Club
                    de Lealtad bonificado, Apple Wallet y Google Wallet con QR, configuración inicial y capacitación.
                  </p>
                </div>

                <div className="grid shrink-0 grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#122347]/40 bg-[#FAF5EE] p-3.5">
                    <p className="text-[11px] font-medium text-[#422E24]/70">De contado</p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-[#122347]">
                      Q24,000
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#D2AC79]/55 bg-[#FAF5EE] p-3.5">
                    <p className="text-[11px] font-medium text-[#422E24]/70">Quincenal</p>
                    <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#422E24]">
                      12 × Q2,250
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#D2AC79]/55 bg-[#FAF5EE] p-3.5">
                    <p className="text-[11px] font-medium text-[#422E24]/70">Mensual</p>
                    <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-[#422E24]">
                      12 × Q2,500
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#D2AC79]/45 pt-4 text-xs text-[#422E24]/75">
                <p>
                  Condiciones: Membresía Apple Developer US$99/año si aplica; alojamiento, dominio y
                  comisiones de pasarela de pago se cubren por separado.{' '}
                  <strong className="text-[#422E24]">
                    Luis Felipe Díaz Figueroa · Media Fusion Online
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6 lg:col-span-6">
              <h2 className="font-display text-2xl font-medium text-[#422E24]">
                Barra Móvil COFFEA para Eventos
              </h2>
              <p className="mt-1 text-sm text-[#422E24]/80">
                Calcula al instante una cotización para oficinas, eventos privados o reuniones en Modra.
              </p>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#422E24]">
                  <span>Número de asistentes</span>
                  <span className="font-mono tabular-nums">{guests} personas</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={200}
                  step={5}
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    setQuoteSent(false);
                  }}
                  className="mt-2 w-full accent-[#122347]"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#422E24]">Modalidad de barra</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    { id: 'espresso', label: 'Espresso Bar', sub: 'Q38 / persona' },
                    { id: 'metodos', label: 'Métodos & Cold Brew', sub: 'Q48 / persona' },
                    { id: 'completo', label: 'Barra Completa + Matcha', sub: 'Q65 / persona' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setBarType(opt.id as 'espresso' | 'metodos' | 'completo');
                        setQuoteSent(false);
                      }}
                      className={`rounded-lg border p-3 text-left ${
                        barType === opt.id
                          ? 'border-[#122347] bg-[#122347]/[0.06]'
                          : 'border-[#D2AC79]/50 bg-[#EFE3D5]/55'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#422E24]">{opt.label}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#422E24]/70">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-[#422E24]">
                <input
                  type="checkbox"
                  checked={includePastries}
                  onChange={(e) => {
                    setIncludePastries(e.target.checked);
                    setQuoteSent(false);
                  }}
                  className="h-4 w-4 accent-[#122347]"
                />
                <span>Incluir estación de empanadas y galletas COFFEA (+Q28/persona)</span>
              </label>

              <div className="flex items-baseline justify-between border-t border-[#D2AC79]/40 pt-4">
                <div>
                  <p className="text-xs text-[#422E24]/70">Incluye baristas, montaje y cristalería</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums text-[#422E24]">
                    Q{estimatedQuote.toLocaleString('es-GT')}.00
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteSent(true)}
                  className="rounded-lg bg-[#122347] px-4 py-2.5 text-xs font-semibold text-[#FAF5EE] hover:bg-[#1B3363]"
                >
                  {quoteSent ? 'Propuesta registrada' : 'Generar propuesta'}
                </button>
              </div>
              {quoteSent && (
                <p className="text-xs font-medium text-[#122347]">
                  Cotización guardada para {guests} invitados ({barType}). Nuestro equipo en Modra Zona 4 la confirmará pronto.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#D2AC79]/50 bg-[#FAF5EE] p-6 lg:col-span-6">
            <h2 className="font-display text-2xl font-medium text-[#422E24]">
              Tarjeta Digital en Apple & Google Wallet
            </h2>
            <p className="mt-1 text-sm text-[#422E24]/80">
              Vista conceptual de la credencial de membresía y carta directa para mesas de COFFEA Modra Zona 4.
            </p>
            <div className="mt-5 overflow-hidden rounded-xl border border-[#D2AC79]/50">
              <img
                src={MEDIA_ASSETS.walletPreview}
                alt="Tarjeta conceptual de COFFEA en Apple Wallet y Google Wallet"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
        </div>
      )}
    </section>
  );
}
