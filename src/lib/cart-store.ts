export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const STORAGE_KEY = "piel-y-metodo-cart";
const EMPTY: CartItem[] = [];

let state: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) state = JSON.parse(stored) as CartItem[];
  } catch {
    // ignore corrupt storage
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  hydrateFromStorage();
  return state;
}

export function getServerSnapshot() {
  return EMPTY;
}

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  hydrateFromStorage();
  const existing = state.find((i) => i.id === item.id);
  state = existing
    ? state.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
      )
    : [...state, { ...item, quantity }];
  persist();
  emit();
}

export function removeItem(id: string) {
  hydrateFromStorage();
  state = state.filter((i) => i.id !== id);
  persist();
  emit();
}

export function setItemQuantity(id: string, quantity: number) {
  hydrateFromStorage();
  state =
    quantity <= 0
      ? state.filter((i) => i.id !== id)
      : state.map((i) => (i.id === id ? { ...i, quantity } : i));
  persist();
  emit();
}

export function clearCart() {
  hydrateFromStorage();
  state = EMPTY;
  persist();
  emit();
}
