export type MenuCategory =
  | 'Todo'
  | 'Espresso bar'
  | 'Métodos de café'
  | 'Té & Cacao'
  | 'Bebidas Frías'
  | 'Empanadas & Sándwiches'
  | 'Postres'
  | 'Café en bolsa'
  | 'Edición Anticipada';

export type FlavorTag =
  | 'intenso'
  | 'cremoso'
  | 'dulce'
  | 'especiado'
  | 'floral'
  | 'cítrico'
  | 'chocolate'
  | 'cacao'
  | 'frutal'
  | 'refrescante'
  | 'salado'
  | 'botánico';

export type OriginToneName =
  | 'Azul'
  | 'Burdeos'
  | 'Verde Olivo'
  | 'Ocre'
  | 'Rosa Terracota';

export interface CoffeeOriginCode {
  tone: OriginToneName;
  hex: string;
  label: string;
}

export interface MenuItem {
  id: string;
  numericId: number;
  name: string;
  category: Exclude<MenuCategory, 'Todo' | 'Edición Anticipada'>;
  subCategory: string;
  price: number;
  description: string;
  photo: string;
  photoX?: number;
  photoY?: number;
  photoSize?: string;
  objectFit?: 'cover' | 'contain';
  isAtlas?: boolean;
  isRealPhoto?: boolean;
  milkEligible?: boolean;
  flavorTags: FlavorTag[];
  earlyAccessTier?: 'Plata' | 'Oro';
  popularityScore: number;
  originNote?: string;
  originCode?: CoffeeOriginCode;
  variants?: string[];
  prepType: 'drink' | 'food' | 'beans';
}

export type LoyaltyTier = 'Bronce' | 'Plata' | 'Oro';

export interface TierDefinition {
  tier: LoyaltyTier;
  minPoints: number;
  maxPoints: number | null;
  pointsRateLabel: string;
  freeAltMilk: boolean;
  earlyAccess: boolean;
  birthdayGiftItemId: string;
  perks: string[];
}

export interface LoyaltyReward {
  id: string;
  title: string;
  subtitle: string;
  costPoints: number;
  linkedMenuItemId: string;
  minTier: LoyaltyTier;
  photo: string;
  photoX?: number;
  photoY?: number;
  photoSize?: string;
}

export interface CustomDrinkOption {
  id: string;
  label: string;
  description: string;
  priceDelta: number;
  colorHex: string;
  tag: FlavorTag;
}

export interface CustomDrinkConfig {
  name: string;
  baseId: string;
  prepId: string;
  milkId: string;
  syrupId: string;
  syrupPumps: 0 | 1 | 2 | 3;
  toppingId: string;
  notes?: string;
}

export interface SavedCustomDrink extends CustomDrinkConfig {
  id: string;
  createdAt: string;
  unitPrice: number;
  summary: string;
}

export interface CartItem {
  cartKey: string;
  kind: 'menu' | 'custom' | 'reward' | 'pairing';
  menuItemId?: string;
  name: string;
  subtitle: string;
  unitPrice: number;
  quantity: number;
  milkChoice?: 'Entera' | 'Deslactosada' | 'Almendra' | 'Avena';
  rewardId?: string;
  rewardPointsCost?: number;
  flavorTags: FlavorTag[];
  photo: string;
  photoX?: number;
  photoY?: number;
  photoSize?: string;
}

export type OrderStatus = 'Recibido' | 'Confirmado' | 'Preparando' | 'Listo' | 'Entregado';

export interface OrderRecord {
  id: string;
  createdAt: string;
  customerName: string;
  deliveryType: 'retiro' | 'apartamento';
  apartment?: string;
  pickupWindow: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    flavorTags: FlavorTag[];
    kind: CartItem['kind'];
  }[];
  totalPaid: number;
  discountApplied: number;
  pointsEarned: number;
  pointsSpent: number;
  status: OrderStatus;
  notes?: string;
}

export interface PairingRecommendation {
  id: string;
  badge: string;
  headline: string;
  rationale: string;
  drink: MenuItem;
  pastry: MenuItem;
  regularTotal: number;
  pairingPrice: number;
  savings: number;
  mood: 'todo' | 'energia' | 'dulce' | 'salado';
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: 'g' | 'ml' | 'unidad';
  stock: number;
  minStock: number;
  costPerUnit: number;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  residentType: 'Residente Modra' | 'Huésped Airbnb' | 'Visitante Zona 4';
  apartment: string;
  points: number;
  lifetimePoints: number;
  birthdayClaimedYear: number | null;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  deliveryType: 'retiro' | 'apartamento';
}

