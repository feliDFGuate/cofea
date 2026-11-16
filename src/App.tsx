import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { CustomDrinkStudio } from './components/CustomDrinkStudio';
import { HeroSection } from './components/HeroSection';
import { LoyaltySection } from './components/LoyaltySection';
import { MenuSection } from './components/MenuSection';
import { Navbar, type ActiveWorkspace } from './components/Navbar';
import {
  LiveNotificationBanner,
  NotificationDrawer,
} from './components/NotificationCenter';
import { OperationsView } from './components/OperationsView';
import { PerfectPairingSection } from './components/PerfectPairingSection';
import { SystemTourSection } from './components/SystemTourSection';
import {
  INITIAL_CUSTOMER,
  INITIAL_INVENTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDER_HISTORY,
  INITIAL_SAVED_DRINKS,
  LOYALTY_TIERS,
  MEDIA_ASSETS,
  MENU_ITEMS,
} from './data/coffeaData';
import type {
  CartItem,
  CustomDrinkConfig,
  CustomerProfile,
  FlavorTag,
  InventoryItem,
  LoyaltyReward,
  LoyaltyTier,
  MenuItem,
  OrderNotification,
  OrderRecord,
  OrderStatus,
  PairingRecommendation,
  SavedCustomDrink,
} from './types/coffea';
import {
  buildStatusNotification,
  getOrderStatusLabel,
} from './utils/orderStatus';
import type { CartPairingAnalysis } from './utils/recommendationEngine';

const STORAGE_KEY = 'coffea_wow_state_v1';

interface PersistedState {
  customer: CustomerProfile;
  savedDrinks: SavedCustomDrink[];
  orderHistory: OrderRecord[];
  inventory: InventoryItem[];
  cart: CartItem[];
  notifications: OrderNotification[];
  autoSimulate: boolean;
  soundEnabled: boolean;
}

function deriveTier(lifetimePoints: number): LoyaltyTier {
  if (lifetimePoints >= 700) return 'Oro';
  if (lifetimePoints >= 250) return 'Plata';
  return 'Bronce';
}

function playAlertChime(isReady: boolean) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const freqs = isReady ? [587.33, 880] : [523.25, 659.25];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.045, now + idx * 0.11 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.11 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.3);
    });
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 700);
  } catch {
    // Ignore autoplay-blocked audio errors
  }
}

function getInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed.customer && Array.isArray(parsed.orderHistory)) {
        return {
          customer: parsed.customer,
          savedDrinks: parsed.savedDrinks ?? INITIAL_SAVED_DRINKS,
          orderHistory: parsed.orderHistory,
          inventory: parsed.inventory ?? INITIAL_INVENTORY,
          cart: parsed.cart ?? [],
          notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
          autoSimulate: parsed.autoSimulate ?? true,
          soundEnabled: parsed.soundEnabled ?? true,
        };
      }
    }
  } catch {
    // Fallback to initial seeded state
  }
  return {
    customer: INITIAL_CUSTOMER,
    savedDrinks: INITIAL_SAVED_DRINKS,
    orderHistory: INITIAL_ORDER_HISTORY,
    inventory: INITIAL_INVENTORY,
    cart: [],
    notifications: INITIAL_NOTIFICATIONS,
    autoSimulate: true,
    soundEnabled: true,
  };
}

const AUTO_SIM_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  Recibido: 'Confirmado',
  Confirmado: 'Preparando',
  Preparando: 'Listo',
};

export default function App() {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [workspace, setWorkspace] = useState<ActiveWorkspace>('storefront');
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<OrderNotification | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [studioPreset, setStudioPreset] = useState<CustomDrinkConfig | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const currentTier = useMemo(
    () => deriveTier(state.customer.lifetimePoints),
    [state.customer.lifetimePoints],
  );

  const unreadNotifications = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    if (!activeAlert) return;
    const t = setTimeout(() => setActiveAlert(null), 5800);
    return () => clearTimeout(t);
  }, [activeAlert?.id]);

  // Simulated kitchen progression for active orders (Recibido -> Confirmado -> En preparación -> Listo para recoger)
  useEffect(() => {
    if (!state.autoSimulate) return;

    const targetOrder = state.orderHistory.find(
      (ord) => AUTO_SIM_NEXT[ord.status] !== undefined,
    );
    if (!targetOrder) return;

    const nextStatus = AUTO_SIM_NEXT[targetOrder.status];
    if (!nextStatus) return;

    const timer = setTimeout(() => {
      const notif = buildStatusNotification(targetOrder, nextStatus);
      setState((prev) => ({
        ...prev,
        orderHistory: prev.orderHistory.map((ord) =>
          ord.id === targetOrder.id ? { ...ord, status: nextStatus } : ord,
        ),
        notifications: [notif, ...prev.notifications].slice(0, 25),
      }));
      setActiveAlert(notif);
      if (state.soundEnabled) {
        playAlertChime(nextStatus === 'Listo');
      }
    }, 6500);

    return () => clearTimeout(timer);
  }, [state.autoSimulate, state.orderHistory, state.soundEnabled]);

  const cartCount = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    [state.cart],
  );

  const handleAddMenuItem = (
    item: MenuItem,
    milkChoice?: 'Entera' | 'Deslactosada' | 'Almendra' | 'Avena',
  ) => {
    const isFreeAltMilk = currentTier === 'Plata' || currentTier === 'Oro';
    const altMilkExtra =
      item.milkEligible &&
      (milkChoice === 'Avena' || milkChoice === 'Almendra') &&
      !isFreeAltMilk
        ? 5
        : 0;
    const unitPrice = item.price + altMilkExtra;
    const milkSuffix = item.milkEligible && milkChoice ? ` · Leche ${milkChoice}` : '';
    const cartKey = `menu-${item.id}-${milkChoice ?? 'std'}`;

    setState((prev) => {
      const existing = prev.cart.find((c) => c.cartKey === cartKey);
      const nextCart = existing
        ? prev.cart.map((c) =>
            c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c,
          )
        : [
            ...prev.cart,
            {
              cartKey,
              kind: 'menu' as const,
              menuItemId: item.id,
              name: item.name,
              subtitle: `${item.subCategory}${milkSuffix}`,
              unitPrice,
              quantity: 1,
              milkChoice,
              flavorTags: item.flavorTags,
              photo: item.photo,
              photoX: item.photoX,
              photoY: item.photoY,
              photoSize: item.photoSize,
            },
          ];
      return { ...prev, cart: nextCart };
    });
    showToast(`${item.name} agregado al pedido`);
  };

  const handleAddPairing = (pairing: PairingRecommendation) => {
    const cartKey = `pairing-${pairing.id}`;
    setState((prev) => {
      const existing = prev.cart.find((c) => c.cartKey === cartKey);
      const nextCart = existing
        ? prev.cart.map((c) =>
            c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c,
          )
        : [
            ...prev.cart,
            {
              cartKey,
              kind: 'pairing' as const,
              name: `Perfect Pairing: ${pairing.headline}`,
              subtitle: `${pairing.drink.name} + ${pairing.pastry.name} (−Q${pairing.savings.toFixed(0)})`,
              unitPrice: pairing.pairingPrice,
              quantity: 1,
              flavorTags: Array.from(
                new Set([...pairing.drink.flavorTags, ...pairing.pastry.flavorTags]),
              ),
              photo: pairing.drink.photo,
              photoX: pairing.drink.photoX,
              photoY: pairing.drink.photoY,
              photoSize: pairing.drink.photoSize,
            },
          ];
      return { ...prev, cart: nextCart };
    });
    showToast(`Combinación "${pairing.headline}" agregada`);
  };

  const handleConvertCartToPairing = (analysis: CartPairingAnalysis) => {
    const { pairing, mode, matchedSets, potentialSavings } = analysis;
    const countToAdd = mode === 'exact' ? matchedSets : 1;

    setState((prev) => {
      const consumeMenuItemUnits = (
        items: CartItem[],
        menuItemId: string,
        unitsToRemove: number,
      ): CartItem[] => {
        let remaining = unitsToRemove;
        const result: CartItem[] = [];
        for (const item of items) {
          if (remaining > 0 && item.kind === 'menu' && item.menuItemId === menuItemId) {
            if (item.quantity <= remaining) {
              remaining -= item.quantity;
              continue;
            }
            result.push({ ...item, quantity: item.quantity - remaining });
            remaining = 0;
            continue;
          }
          result.push(item);
        }
        return result;
      };

      let updatedCart = consumeMenuItemUnits(prev.cart, pairing.drink.id, countToAdd);
      updatedCart = consumeMenuItemUnits(updatedCart, pairing.pastry.id, countToAdd);

      const cartKey = `pairing-${pairing.id}`;
      const existingPairing = updatedCart.find((c) => c.cartKey === cartKey);
      if (existingPairing) {
        updatedCart = updatedCart.map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: c.quantity + countToAdd } : c,
        );
      } else {
        updatedCart = [
          ...updatedCart,
          {
            cartKey,
            kind: 'pairing' as const,
            name: `Perfect Pairing: ${pairing.headline}`,
            subtitle: `${pairing.drink.name} + ${pairing.pastry.name} (−Q${pairing.savings.toFixed(0)})`,
            unitPrice: pairing.pairingPrice,
            quantity: countToAdd,
            flavorTags: Array.from(
              new Set([...pairing.drink.flavorTags, ...pairing.pastry.flavorTags]),
            ),
            photo: pairing.drink.photo,
            photoX: pairing.drink.photoX,
            photoY: pairing.drink.photoY,
            photoSize: pairing.drink.photoSize,
          },
        ];
      }

      return { ...prev, cart: updatedCart };
    });

    showToast(
      `Perfect Pairing aplicado: ahorraste Q${potentialSavings.toFixed(2)}`,
    );
  };

  const handleCustomizeInStudio = (item: MenuItem) => {
    const baseId =
      item.id.includes('matcha')
        ? 'matcha-uji'
        : item.id.includes('chai')
        ? 'chai-house'
        : item.id.includes('cacao') || item.id.includes('chocolate')
        ? 'cacao-ancestral'
        : item.id.includes('cold-brew')
        ? 'cold-brew-base'
        : 'espresso-doble';
    const prepId = item.id.includes('foam')
      ? 'cold-foam-cap'
      : item.id.includes('iced')
      ? 'iced-shaken'
      : item.id.includes('pourover') || item.id.includes('aeropress')
      ? 'botanical-infusion'
      : 'hot-steamed';
    const syrupId = item.id.includes('lavender')
      ? 'lavanda-naranja'
      : item.id.includes('honey')
      ? 'miel-criolla'
      : item.id.includes('caramel')
      ? 'caramelo-panela'
      : item.id.includes('mocha')
      ? 'ganache-cacao'
      : 'sin-sirope';

    setStudioPreset({
      name: `${item.name} Personalizado`,
      baseId,
      prepId,
      milkId: item.milkEligible ? 'avena' : 'none',
      syrupId,
      syrupPumps: syrupId === 'sin-sirope' ? 0 : 2,
      toppingId: 'sin-topping',
    });
    document.getElementById('barista-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveCreation = (drink: SavedCustomDrink) => {
    setState((prev) => ({
      ...prev,
      savedDrinks: [drink, ...prev.savedDrinks.filter((d) => d.name !== drink.name)],
    }));
    showToast(`"${drink.name}" guardada en tu perfil`);
  };

  const handleDeleteCreation = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedDrinks: prev.savedDrinks.filter((d) => d.id !== id),
    }));
  };

  const handleAddCustomToCart = (
    config: CustomDrinkConfig,
    unitPrice: number,
    summary: string,
    tags: FlavorTag[],
  ) => {
    const cartKey = `custom-${config.name}-${config.baseId}-${config.prepId}-${config.milkId}-${config.syrupId}-${config.toppingId}`;
    setState((prev) => {
      const existing = prev.cart.find((c) => c.cartKey === cartKey);
      const nextCart = existing
        ? prev.cart.map((c) =>
            c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c,
          )
        : [
            ...prev.cart,
            {
              cartKey,
              kind: 'custom' as const,
              name: config.name,
              subtitle: summary,
              unitPrice,
              quantity: 1,
              flavorTags: tags,
              photo: MEDIA_ASSETS.heroPoster,
            },
          ];
      return { ...prev, cart: nextCart };
    });
    showToast(`"${config.name}" agregada al pedido`);
  };

  const handleRedeemReward = (reward: LoyaltyReward) => {
    const linked = MENU_ITEMS.find((m) => m.id === reward.linkedMenuItemId);
    if (!linked || state.customer.points < reward.costPoints) return;

    const cartKey = `reward-${reward.id}-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        points: Math.max(0, prev.customer.points - reward.costPoints),
      },
      cart: [
        ...prev.cart,
        {
          cartKey,
          kind: 'reward',
          menuItemId: linked.id,
          rewardId: reward.id,
          rewardPointsCost: reward.costPoints,
          name: `${reward.title} (Canje Club)`,
          subtitle: `Recompensa ${reward.costPoints} pts · Cortesía Q0.00`,
          unitPrice: 0,
          quantity: 1,
          flavorTags: linked.flavorTags,
          photo: reward.photo,
          photoX: reward.photoX,
          photoY: reward.photoY,
          photoSize: reward.photoSize,
        },
      ],
    }));
    showToast(`Recompensa "${reward.title}" añadida en Q0.00`);
    setCartOpen(true);
  };

  const handleClaimBirthdayGift = () => {
    const currentYear = 2026;
    if (state.customer.birthdayClaimedYear === currentYear) return;
    const tierDef = LOYALTY_TIERS.find((t) => t.tier === currentTier) ?? LOYALTY_TIERS[0];
    const giftItem =
      MENU_ITEMS.find((m) => m.id === tierDef.birthdayGiftItemId) ?? MENU_ITEMS[3];

    setState((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        birthdayClaimedYear: currentYear,
      },
      cart: [
        ...prev.cart,
        {
          cartKey: `birthday-${currentYear}`,
          kind: 'reward',
          menuItemId: giftItem.id,
          rewardPointsCost: 0,
          name: `Regalo Cumpleaños · ${giftItem.name}`,
          subtitle: `Cortesía anual Nivel ${currentTier}`,
          unitPrice: 0,
          quantity: 1,
          flavorTags: giftItem.flavorTags,
          photo: giftItem.photo,
          photoX: giftItem.photoX,
          photoY: giftItem.photoY,
          photoSize: giftItem.photoSize,
        },
      ],
    }));
    showToast(`Regalo de cumpleaños (${giftItem.name}) añadido en Q0.00`);
    setCartOpen(true);
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setState((prev) => {
      const target = prev.cart.find((c) => c.cartKey === cartKey);
      if (!target) return prev;
      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        const refundPts =
          target.kind === 'reward' && target.rewardPointsCost ? target.rewardPointsCost : 0;
        return {
          ...prev,
          customer: {
            ...prev.customer,
            points: prev.customer.points + refundPts,
          },
          cart: prev.cart.filter((c) => c.cartKey !== cartKey),
        };
      }
      return {
        ...prev,
        cart: prev.cart.map((c) =>
          c.cartKey === cartKey ? { ...c, quantity: nextQty } : c,
        ),
      };
    });
  };

  const handleRemoveCartItem = (cartKey: string) => {
    setState((prev) => {
      const target = prev.cart.find((c) => c.cartKey === cartKey);
      if (!target) return prev;
      const refundPts =
        target.kind === 'reward' && target.rewardPointsCost ? target.rewardPointsCost : 0;
      const isBirthday = cartKey.startsWith('birthday-');
      return {
        ...prev,
        customer: {
          ...prev.customer,
          points: prev.customer.points + refundPts,
          birthdayClaimedYear: isBirthday ? null : prev.customer.birthdayClaimedYear,
        },
        cart: prev.cart.filter((c) => c.cartKey !== cartKey),
      };
    });
  };

  const handleCheckout = (details: {
    customerName: string;
    phone: string;
    deliveryType: 'retiro' | 'apartamento';
    apartment: string;
    pickupWindow: string;
    notes: string;
  }): OrderRecord => {
    const empanadaCount = state.cart
      .filter((it) => it.kind === 'menu' && it.name.toLowerCase().includes('empanada'))
      .reduce((sum, it) => sum + it.quantity, 0);
    const discountApplied = Math.floor(empanadaCount / 3) * 5;
    const subtotal = state.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const totalPaid = Math.max(0, subtotal - discountApplied);
    const pointsEarned = Math.round(totalPaid);
    const pointsSpent = state.cart.reduce(
      (sum, it) => sum + (it.rewardPointsCost ?? 0),
      0,
    );

    const newOrder: OrderRecord = {
      id: `COF-${Math.floor(4900 + Math.random() * 5000)}`,
      createdAt: new Date().toISOString(),
      customerName: details.customerName,
      deliveryType: details.deliveryType,
      apartment: details.apartment,
      pickupWindow: details.pickupWindow,
      items: state.cart.map((c) => ({
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        flavorTags: c.flavorTags,
        kind: c.kind,
      })),
      totalPaid,
      discountApplied,
      pointsEarned,
      pointsSpent,
      status: 'Recibido',
      notes: details.notes || undefined,
    };

    const initialNotif = buildStatusNotification(newOrder, 'Recibido');
    const prevTier = deriveTier(state.customer.lifetimePoints);
    const nextLifetime = state.customer.lifetimePoints + pointsEarned;
    const nextTier = deriveTier(nextLifetime);

    const drinkUnits = state.cart
      .filter((c) => c.kind !== 'menu' || !c.name.toLowerCase().includes('empanada'))
      .reduce((s, c) => s + c.quantity, 0);

    setState((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        name: details.customerName,
        phone: details.phone,
        apartment: details.apartment || prev.customer.apartment,
        points: prev.customer.points + pointsEarned,
        lifetimePoints: nextLifetime,
      },
      orderHistory: [newOrder, ...prev.orderHistory],
      notifications: [initialNotif, ...prev.notifications].slice(0, 25),
      inventory: prev.inventory.map((inv) => {
        if (inv.id === 'inv-antigua') {
          return { ...inv, stock: Math.max(0, inv.stock - drinkUnits * 18) };
        }
        if (inv.id === 'inv-empanadas' && empanadaCount > 0) {
          return { ...inv, stock: Math.max(0, inv.stock - empanadaCount) };
        }
        return inv;
      }),
      cart: [],
    }));

    setActiveAlert(initialNotif);
    if (state.soundEnabled) {
      playAlertChime(false);
    }

    if (nextTier !== prevTier) {
      showToast(`Felicidades: subiste al nivel ${nextTier} en Club COFFEA`);
    }

    return newOrder;
  };

  const handleAdvanceOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const targetOrder = state.orderHistory.find((ord) => ord.id === orderId);
    if (!targetOrder) return;

    const notif = buildStatusNotification(targetOrder, nextStatus);
    setState((prev) => ({
      ...prev,
      orderHistory: prev.orderHistory.map((ord) =>
        ord.id === orderId ? { ...ord, status: nextStatus } : ord,
      ),
      notifications: [notif, ...prev.notifications].slice(0, 25),
    }));

    setActiveAlert(notif);
    if (state.soundEnabled) {
      playAlertChime(nextStatus === 'Listo');
    }
    showToast(
      `#${orderId}: ${getOrderStatusLabel(nextStatus, targetOrder.deliveryType)}`,
    );
  };

  const handleTriggerSimulatedOrder = () => {
    const simulatedOrder: OrderRecord = {
      id: `COF-${Math.floor(5100 + Math.random() * 4800)}`,
      createdAt: new Date().toISOString(),
      customerName: state.customer.name,
      deliveryType: 'retiro',
      pickupWindow: 'Inmediato (10–15 min)',
      items: [
        {
          name: 'Spiced honey coffee',
          quantity: 1,
          unitPrice: 35,
          flavorTags: ['especiado', 'dulce', 'cremoso'],
          kind: 'menu',
        },
        {
          name: 'Empanada caprese',
          quantity: 1,
          unitPrice: 20,
          flavorTags: ['salado', 'botánico'],
          kind: 'menu',
        },
      ],
      totalPaid: 55,
      discountApplied: 0,
      pointsEarned: 55,
      pointsSpent: 0,
      status: 'Recibido',
    };

    const notif = buildStatusNotification(simulatedOrder, 'Recibido');
    setState((prev) => ({
      ...prev,
      orderHistory: [simulatedOrder, ...prev.orderHistory],
      notifications: [notif, ...prev.notifications].slice(0, 25),
    }));
    setActiveAlert(notif);
    if (state.soundEnabled) {
      playAlertChime(false);
    }
  };

  const handleRestockItem = (itemId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((inv) =>
        inv.id === itemId
          ? { ...inv, stock: Math.max(0, inv.stock + amount) }
          : inv,
      ),
    }));
    showToast(
      amount >= 0
        ? 'Existencia actualizada en inventario'
        : 'Consumo descontado del inventario',
    );
  };

  const handleSimulateShiftConsumption = () => {
    const deductions: Record<string, number> = {
      'inv-antigua': 450,
      'inv-acatenango': 520,
      'inv-oat': 1800,
      'inv-almond': 900,
      'inv-matcha': 35,
      'inv-cacao': 240,
      'inv-cheesecake': 3,
      'inv-empanadas': 11,
    };

    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((inv) => {
        const delta = deductions[inv.id] ?? 0;
        return delta > 0
          ? { ...inv, stock: Math.max(0, inv.stock - delta) }
          : inv;
      }),
    }));
    showToast('Consumo de turno aplicado al inventario');
  };

  const handleResetDemo = () => {
    const fresh: PersistedState = {
      customer: INITIAL_CUSTOMER,
      savedDrinks: INITIAL_SAVED_DRINKS,
      orderHistory: INITIAL_ORDER_HISTORY,
      inventory: INITIAL_INVENTORY,
      cart: [],
      notifications: INITIAL_NOTIFICATIONS,
      autoSimulate: true,
      soundEnabled: true,
    };
    setState(fresh);
    setActiveAlert(INITIAL_NOTIFICATIONS[0]);
    showToast('Perfil demo restablecido (225 pts · Bronce)');
  };

  return (
    <div className="bg-coffea-fiber min-h-screen text-[#422E24]">
      <Navbar
        workspace={workspace}
        onChangeWorkspace={setWorkspace}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        userTier={currentTier}
        userPoints={state.customer.points}
      />

      <LiveNotificationBanner
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        onOpenCenter={() => setNotificationsOpen(true)}
      />

      <main>
        {workspace === 'operations' ? (
          <OperationsView
            orders={state.orderHistory}
            inventory={state.inventory}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onRestockItem={handleRestockItem}
            onSimulateShiftConsumption={handleSimulateShiftConsumption}
            onBackToStorefront={() => setWorkspace('storefront')}
          />
        ) : (
          <>
            <HeroSection
              customerName={state.customer.name}
              tier={currentTier}
              points={state.customer.points}
              savedCount={state.savedDrinks.length}
              lastOrder={state.orderHistory[0]}
              onExploreMenu={() =>
                document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' })
              }
              onOpenStudio={() =>
                document.getElementById('barista-studio')?.scrollIntoView({ behavior: 'smooth' })
              }
              onOpenNotifications={() => setNotificationsOpen(true)}
            />

            <SystemTourSection
              onJumpToSection={(sectionId) =>
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
              }
              onOpenOperations={() => {
                setWorkspace('operations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <PerfectPairingSection
              menu={MENU_ITEMS}
              orderHistory={state.orderHistory}
              onAddPairing={handleAddPairing}
            />

            <MenuSection
              menu={MENU_ITEMS}
              userTier={currentTier}
              onAddMenuItem={handleAddMenuItem}
              onCustomizeInStudio={handleCustomizeInStudio}
              onJumpToLoyalty={() =>
                document.getElementById('club-lealtad')?.scrollIntoView({ behavior: 'smooth' })
              }
            />

            <CustomDrinkStudio
              userTier={currentTier}
              savedDrinks={state.savedDrinks}
              presetConfig={studioPreset}
              onSaveCreation={handleSaveCreation}
              onDeleteCreation={handleDeleteCreation}
              onAddCustomToCart={handleAddCustomToCart}
            />

            <LoyaltySection
              customer={state.customer}
              currentTier={currentTier}
              orderHistory={state.orderHistory}
              onRedeemReward={handleRedeemReward}
              onClaimBirthdayGift={handleClaimBirthdayGift}
              onJumpToEarlyAccess={() =>
                document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' })
              }
            />
          </>
        )}
      </main>

      <footer className="bg-coffea-fiber border-t border-[#D2AC79]/45">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-[#422E24]/75 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <span className="font-display text-base font-medium tracking-[0.14em] text-[#422E24]">
              COFFEA
            </span>
            <span className="ml-3">
              Cafés Especiales · Modra Zona 4, Ciudad de Guatemala · Tostado en Antigua Guatemala
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="underline-offset-4 hover:text-[#122347] hover:underline"
            >
              Centro de alertas ({unreadNotifications})
            </button>
            <button
              type="button"
              onClick={() => setWorkspace(workspace === 'operations' ? 'storefront' : 'operations')}
              className="underline-offset-4 hover:text-[#122347] hover:underline"
            >
              {workspace === 'operations' ? 'Ir a la carta pública' : 'Consola de barra y cotización'}
            </button>
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1 underline-offset-4 hover:text-[#122347] hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reiniciar demo</span>
            </button>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={state.cart}
        customer={state.customer}
        currentTier={currentTier}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onApplyPairingComparison={handleConvertCartToPairing}
        onCheckout={handleCheckout}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={state.notifications}
        orders={state.orderHistory}
        autoSimulate={state.autoSimulate}
        soundEnabled={state.soundEnabled}
        onToggleAutoSimulate={() =>
          setState((prev) => ({ ...prev, autoSimulate: !prev.autoSimulate }))
        }
        onToggleSound={() =>
          setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onAdvanceOrderStatus={handleAdvanceOrderStatus}
        onTriggerSimulatedOrder={handleTriggerSimulatedOrder}
        onMarkAllRead={() =>
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) => ({ ...n, read: true })),
          }))
        }
        onClearNotifications={() =>
          setState((prev) => ({ ...prev, notifications: [] }))
        }
        onMarkRead={(id) =>
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          }))
        }
      />

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-[#E5C36B]/40 bg-[#122347] px-4 py-2.5 text-xs font-medium text-[#FAF5EE] shadow-lg"
        >
          <Check className="h-3.5 w-3.5 text-[#E5C36B]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
