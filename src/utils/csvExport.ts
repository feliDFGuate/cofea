import type { OrderRecord } from '../types/coffea';
import { getOrderStatusLabel } from './orderStatus';

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const raw = String(value);
  // Protect against spreadsheet formula injection on string values
  const safe = /^[=+\-@\t\r]/.test(raw) && typeof value === 'string' ? `'${raw}` : raw;
  if (/[",\r\n;]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function formatLocalDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildOrdersCsvContent(orders: OrderRecord[]): string {
  const headers = [
    'ID Pedido',
    'Fecha y Hora',
    'Fecha ISO',
    'Cliente',
    'Tipo de Entrega',
    'Apartamento',
    'Ventana de Entrega',
    'Estado',
    'Cantidad de Items',
    'Detalle de Productos',
    'Descuento Aplicado (Q)',
    'Total Pagado (Q)',
    'Puntos Ganados',
    'Puntos Canjeados',
    'Notas',
  ];

  const rows = orders.map((order) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemsDetail = order.items
      .map((item) => `${item.quantity}x ${item.name} (Q${item.unitPrice.toFixed(2)})`)
      .join(' | ');

    const deliveryLabel =
      order.deliveryType === 'apartamento' ? 'Entrega Modra' : 'Retiro en barra';

    return [
      order.id,
      formatLocalDateTime(order.createdAt),
      order.createdAt,
      order.customerName,
      deliveryLabel,
      order.apartment ?? '',
      order.pickupWindow,
      getOrderStatusLabel(order.status, order.deliveryType),
      itemCount,
      itemsDetail,
      order.discountApplied.toFixed(2),
      order.totalPaid.toFixed(2),
      order.pointsEarned,
      order.pointsSpent,
      order.notes ?? '',
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(',');
  });

  // Prepend UTF-8 BOM for proper accent rendering in Microsoft Excel
  return `\uFEFF${[headers.map(escapeCsvCell).join(','), ...rows].join('\r\n')}`;
}

export function downloadOrdersCsv(orders: OrderRecord[]): void {
  const csvContent = buildOrdersCsvContent(orders);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `coffea-historial-pedidos-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
