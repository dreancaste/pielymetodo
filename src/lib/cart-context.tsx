"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  addItem,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setItemQuantity,
  subscribe,
  type CartItem,
} from "@/lib/cart-store";

export type { CartItem };

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { totalItems, totalPrice } = useMemo(
    () => ({
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    [items]
  );

  return {
    items,
    addItem,
    removeItem,
    setQuantity: setItemQuantity,
    clear: clearCart,
    totalItems,
    totalPrice,
  };
}
