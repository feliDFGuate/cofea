import type { OrderNotification, OrderRecord, OrderStatus } from '../types/coffea';

export const ORDER_FLOW: OrderStatus[] = [
  'Recibido',
  'Confirmado',
  'Preparando',
  'Listo',
  'Entregado',
];

export function getOrderStatusLabel(
  status: OrderStatus,
  deliveryType: 'retiro' | 'apartamento' = 'retiro',
): string {
  switch (status) {
    case 'Recibido':
      return 'Pedido recibido';
    case 'Confirmado':
      return 'Confirmado en barra';
    case 'Preparando':
      return 'En preparación';
    case 'Listo':
      return deliveryType === 'apartamento'
        ? 'Listo para entrega en Modra'
        : 'Listo para recoger';
    case 'Entregado':
      return 'Entregado';
  }
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case 'Recibido':
      return 'Confirmado';
    case 'Confirmado':
      return 'Preparando';
    case 'Preparando':
      return 'Listo';
    case 'Listo':
      return 'Entregado';
    case 'Entregado':
      return null;
  }
}

export function buildStatusNotification(
  order: OrderRecord,
  status: OrderStatus,
): OrderNotification {
  const firstItems = order.items
    .slice(0, 2)
    .map((it) => `${it.quantity}× ${it.name}`)
    .join(', ');
  const extraCount = order.items.length > 2 ? ` (+${order.items.length - 2})` : '';
  const itemsPreview = firstItems ? `${firstItems}${extraCount}` : 'tu pedido';

  let title = '';
  let message = '';

  switch (status) {
    case 'Recibido':
      title = `#${order.id} · Pedido recibido`;
      message = `Tu comanda (${itemsPreview}) ingresó a la cola de barra.`;
      break;
    case 'Confirmado':
      title = `#${order.id} · Confirmado en barra`;
      message = `Nuestro barista validó tu pedido (${itemsPreview}) y preparó la extracción.`;
      break;
    case 'Preparando':
      title = `#${order.id} · En preparación`;
      message = `Tu pedido (${itemsPreview}) está en preparación ahora mismo en COFFEA.`;
      break;
    case 'Listo':
      title =
        order.deliveryType === 'apartamento'
          ? `#${order.id} · Listo para entrega en Modra`
          : `#${order.id} · ¡Listo para recoger!`;
      message =
        order.deliveryType === 'apartamento'
          ? `Tu pedido sale rumbo a ${order.apartment || 'tu apartamento en Modra'}.`
          : `Pasa por tu pedido en la barra de COFFEA (${order.pickupWindow}).`;
      break;
    case 'Entregado':
      title = `#${order.id} · Entregado`;
      message = `Pedido completado. Disfruta tu café de especialidad COFFEA.`;
      break;
  }

  return {
    id: `notif-${order.id}-${status}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    status,
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    deliveryType: order.deliveryType,
  };
}
