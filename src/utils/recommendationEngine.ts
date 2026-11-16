import type {
  CartItem,
  FlavorTag,
  MenuItem,
  OrderRecord,
  PairingRecommendation,
} from '../types/coffea';

const TAG_LABELS: Record<FlavorTag, string> = {
  intenso: 'tostado intenso',
  cremoso: 'textura cremosa',
  dulce: 'dulzor panela y miel',
  especiado: 'notas especiadas',
  floral: 'aromas florales',
  cítrico: 'notas cítricas',
  chocolate: 'notas de chocolate',
  cacao: 'cacao ancestral',
  frutal: 'acidez frutal',
  refrescante: 'perfil frío y ligero',
  salado: 'bocado salado',
  botánico: 'matiz botánico',
};

const PAIRING_CATALOG: {
  id: string;
  drinkId: string;
  pastryId: string;
  mood: 'energia' | 'dulce' | 'salado';
  headline: string;
  trendNote: string;
  sharedTags: FlavorTag[];
}[] = [
  {
    id: 'pair-spiced-lotus',
    drinkId: 'spiced-honey',
    pastryId: 'cheesecake-lotus',
    mood: 'dulce',
    headline: 'Miel Criolla & Cheesecake Lotus',
    trendNote: 'La combinación más pedida en Modra Zona 4 durante la tarde.',
    sharedTags: ['especiado', 'dulce', 'cremoso'],
  },
  {
    id: 'pair-coldfoam-brownie',
    drinkId: 'cold-brew-foam',
    pastryId: 'brownie-bar',
    mood: 'energia',
    headline: 'Cold Brew 48h & Brownie Bar',
    trendNote: 'Contraste frío sedoso con cacao oscuro y dulce de leche.',
    sharedTags: ['cacao', 'cremoso', 'refrescante', 'intenso'],
  },
  {
    id: 'pair-pourover-focaccia',
    drinkId: 'honey-pourover',
    pastryId: 'sandwich-focaccia',
    mood: 'salado',
    headline: 'Pour Over Honey & Focaccia',
    trendNote: 'Acidez brillante de Sacatepéquez que equilibra el queso suizo y tomate confit.',
    sharedTags: ['dulce', 'frutal', 'salado', 'botánico'],
  },
  {
    id: 'pair-lavender-fresa',
    drinkId: 'iced-lavender',
    pastryId: 'cheesecake-fresa',
    mood: 'dulce',
    headline: 'Iced Lavender & Cheesecake Fresa',
    trendNote: 'Notas florales de lavanda y naranja junto a fresa fresca y vainilla.',
    sharedTags: ['floral', 'frutal', 'refrescante', 'cremoso'],
  },
  {
    id: 'pair-cappuccino-empanada',
    drinkId: 'cappuccino',
    pastryId: 'empanada-chorizo',
    mood: 'salado',
    headline: 'Pausa COFFEA · Cappuccino & Empanada',
    trendNote: 'El clásico de media mañana en barra con espresso de Antigua.',
    sharedTags: ['cremoso', 'intenso', 'salado', 'especiado'],
  },
  {
    id: 'pair-matcha-galletas',
    drinkId: 'matcha-latte',
    pastryId: 'galletas-coffea',
    mood: 'energia',
    headline: 'Matcha Ceremonial & Galletas COFFEA',
    trendNote: 'Energía sostenida de té verde Uji con chocolate oscuro al 70%.',
    sharedTags: ['botánico', 'cacao', 'cremoso'],
  },
];

export function computePerfectPairings(
  orderHistory: OrderRecord[],
  menu: MenuItem[],
  moodFilter: 'todo' | 'energia' | 'dulce' | 'salado',
): {
  chefPick: PairingRecommendation;
  trendingPick: PairingRecommendation;
  alternatives: PairingRecommendation[];
  topFlavorSummary: string;
} {
  const tagCounts = new Map<FlavorTag, number>();
  const orderedItemNames: string[] = [];

  for (const order of orderHistory) {
    for (const item of order.items) {
      orderedItemNames.push(item.name);
      for (const tag of item.flavorTags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + item.quantity);
      }
    }
  }

  const sortedTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
  const primaryTag: FlavorTag = sortedTags[0]?.[0] ?? 'especiado';
  const secondaryTag: FlavorTag = sortedTags[1]?.[0] ?? 'cremoso';

  const topFlavorSummary = sortedTags.length
    ? `${TAG_LABELS[primaryTag]} y ${TAG_LABELS[secondaryTag]}`
    : 'especias cálidas, cacao y texturas cremosas';

  const built: { rec: PairingRecommendation; historyScore: number; popularity: number }[] = [];

  for (const template of PAIRING_CATALOG) {
    const drink = menu.find((m) => m.id === template.drinkId);
    const pastry = menu.find((m) => m.id === template.pastryId);
    if (!drink || !pastry) continue;

    let historyScore = 0;
    for (const tag of template.sharedTags) {
      historyScore += (tagCounts.get(tag) ?? 0) * 14;
    }
    if (orderedItemNames.some((n) => n.toLowerCase().includes(drink.name.toLowerCase()))) {
      historyScore += 8;
    }

    const regularTotal = drink.price + pastry.price;
    const pairingPrice = Math.round(regularTotal * 0.9);
    const savings = regularTotal - pairingPrice;
    const popularity = Math.round((drink.popularityScore + pastry.popularityScore) / 2);

    const matchedTag = template.sharedTags.find((t) => t === primaryTag || t === secondaryTag);
    const recentRef = orderedItemNames[0] ? `tu historial (${orderedItemNames[0]})` : 'tus gustos recientes';

    built.push({
      rec: {
        id: template.id,
        badge: historyScore > 20 ? 'Para tu paladar' : 'Sugerencia del Chef',
        headline: template.headline,
        rationale: matchedTag
          ? `Seleccionado por afinidad con ${TAG_LABELS[matchedTag]} según ${recentRef}.`
          : template.trendNote,
        drink,
        pastry,
        regularTotal,
        pairingPrice,
        savings,
        mood: template.mood,
      },
      historyScore,
      popularity,
    });
  }

  const filtered =
    moodFilter === 'todo' ? built : built.filter((entry) => entry.rec.mood === moodFilter);
  const pool = filtered.length >= 2 ? filtered : built;

  const byHistory = [...pool].sort((a, b) => b.historyScore - a.historyScore);
  const chefEntry = byHistory[0];
  const chefPick: PairingRecommendation = {
    ...chefEntry.rec,
    badge: orderHistory.length > 0 ? 'Sugerencia del Chef · Tu Paladar' : 'Sugerencia del Chef',
  };

  const remaining = pool.filter((entry) => entry.rec.id !== chefPick.id);
  const byTrend = [...remaining].sort((a, b) => b.popularity - a.popularity);
  const trendEntry = byTrend[0] ?? chefEntry;
  const trendingPick: PairingRecommendation = {
    ...trendEntry.rec,
    badge: `Tendencia en Barra · ${trendEntry.popularity}%`,
    rationale: `${PAIRING_CATALOG.find((p) => p.id === trendEntry.rec.id)?.trendNote ?? trendEntry.rec.rationale}`,
  };

  const alternatives = remaining
    .filter((entry) => entry.rec.id !== trendingPick.id)
    .map((entry) => entry.rec);

  return {
    chefPick,
    trendingPick,
    alternatives,
    topFlavorSummary,
  };
}

export interface CartPairingAnalysis {
  pairing: PairingRecommendation;
  mode: 'exact' | 'partial' | 'active';
  matchedSets: number;
  separateTotal: number;
  pairingTotal: number;
  potentialSavings: number;
  presentItemName?: string;
  missingItemName?: string;
}

export function analyzeCartPairings(
  cart: CartItem[],
  menu: MenuItem[],
): CartPairingAnalysis | null {
  if (cart.length === 0) return null;

  const buildRecommendation = (template: (typeof PAIRING_CATALOG)[number]): PairingRecommendation | null => {
    const drink = menu.find((m) => m.id === template.drinkId);
    const pastry = menu.find((m) => m.id === template.pastryId);
    if (!drink || !pastry) return null;
    const regularTotal = drink.price + pastry.price;
    const pairingPrice = Math.round(regularTotal * 0.9);
    return {
      id: template.id,
      badge: 'Perfect Pairing',
      headline: template.headline,
      rationale: template.trendNote,
      drink,
      pastry,
      regularTotal,
      pairingPrice,
      savings: regularTotal - pairingPrice,
      mood: template.mood,
    };
  };

  const menuCartItems = cart.filter((c) => c.kind === 'menu' && c.menuItemId);

  // 1. Highest priority: exact match where both drink and pastry are currently in cart separately
  let bestExact: CartPairingAnalysis | null = null;
  for (const template of PAIRING_CATALOG) {
    const drinkItems = menuCartItems.filter((c) => c.menuItemId === template.drinkId);
    const pastryItems = menuCartItems.filter((c) => c.menuItemId === template.pastryId);
    const drinkQty = drinkItems.reduce((s, c) => s + c.quantity, 0);
    const pastryQty = pastryItems.reduce((s, c) => s + c.quantity, 0);
    const matchedSets = Math.min(drinkQty, pastryQty);
    if (matchedSets <= 0) continue;

    const pairing = buildRecommendation(template);
    if (!pairing) continue;

    const separateUnit = drinkItems[0].unitPrice + pastryItems[0].unitPrice;
    const separateTotal = matchedSets * separateUnit;
    const pairingTotal = matchedSets * pairing.pairingPrice;
    const potentialSavings = Math.max(0, separateTotal - pairingTotal);
    if (potentialSavings <= 0) continue;

    if (!bestExact || potentialSavings > bestExact.potentialSavings) {
      bestExact = {
        pairing,
        mode: 'exact',
        matchedSets,
        separateTotal,
        pairingTotal,
        potentialSavings,
      };
    }
  }
  if (bestExact) return bestExact;

  // 2. Second priority: partial match where user has one item from a Perfect Pairing
  let bestPartial: CartPairingAnalysis | null = null;
  for (const template of PAIRING_CATALOG) {
    const drinkItems = menuCartItems.filter((c) => c.menuItemId === template.drinkId);
    const pastryItems = menuCartItems.filter((c) => c.menuItemId === template.pastryId);
    const hasDrink = drinkItems.length > 0;
    const hasPastry = pastryItems.length > 0;
    if (hasDrink === hasPastry) continue;

    const pairing = buildRecommendation(template);
    if (!pairing) continue;

    const separateTotal = hasDrink
      ? drinkItems[0].unitPrice + pairing.pastry.price
      : pairing.drink.price + pastryItems[0].unitPrice;
    const pairingTotal = pairing.pairingPrice;
    const potentialSavings = Math.max(0, separateTotal - pairingTotal);
    if (potentialSavings <= 0) continue;

    if (!bestPartial || potentialSavings > bestPartial.potentialSavings) {
      bestPartial = {
        pairing,
        mode: 'partial',
        matchedSets: 1,
        separateTotal,
        pairingTotal,
        potentialSavings,
        presentItemName: hasDrink ? pairing.drink.name : pairing.pastry.name,
        missingItemName: hasDrink ? pairing.pastry.name : pairing.drink.name,
      };
    }
  }
  if (bestPartial) return bestPartial;

  // 3. Third priority: active Perfect Pairing already in cart (show realized savings vs individual)
  for (const cartItem of cart) {
    if (cartItem.kind !== 'pairing') continue;
    const template = PAIRING_CATALOG.find((t) => `pairing-${t.id}` === cartItem.cartKey);
    if (!template) continue;
    const pairing = buildRecommendation(template);
    if (!pairing) continue;
    const separateTotal = cartItem.quantity * pairing.regularTotal;
    const pairingTotal = cartItem.quantity * cartItem.unitPrice;
    const potentialSavings = Math.max(0, separateTotal - pairingTotal);
    if (potentialSavings > 0) {
      return {
        pairing,
        mode: 'active',
        matchedSets: cartItem.quantity,
        separateTotal,
        pairingTotal,
        potentialSavings,
      };
    }
  }

  return null;
}

