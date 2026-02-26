"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useRef,
  type ReactNode,
} from "react";

/* ────────────────────────── Types ────────────────────────── */

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  currency: string;
  imageUrl: string;
  quantity: number;
};

export type LastAddedItem = Omit<CartItem, "quantity"> & { addedAt: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type Action =
  | { type: "add"; item: Omit<CartItem, "quantity">; qty?: number }
  | { type: "remove"; variantId: string }
  | { type: "update_qty"; variantId: string; quantity: number }
  | { type: "clear" }
  | { type: "toggle" }
  | { type: "close" }
  | { type: "hydrate"; items: CartItem[] };

/* ────────────────────────── Reducer ────────────────────────── */

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find(
        (i) => i.variantId === action.item.variantId,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + (action.qty ?? 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, quantity: action.qty ?? 1 },
        ],
      };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter((i) => i.variantId !== action.variantId),
      };
    case "update_qty":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.variantId !== action.variantId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.variantId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    case "clear":
      return { ...state, items: [] };
    case "toggle":
      return { ...state, isOpen: !state.isOpen };
    case "close":
      return { ...state, isOpen: false };
    case "hydrate":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

/* ────────────────────────── Context ────────────────────────── */

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
  lastAdded: LastAddedItem | null;
  dismissLastAdded: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "magnolia_cart";

/* ────────────────────────── Provider ────────────────────────── */

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const [lastAdded, setLastAdded] = useState<LastAddedItem | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        if (Array.isArray(items)) dispatch({ type: "hydrate", items });
      }
    } catch {
      // ignore corrupted data
    }
  }, []);

  // Persist to localStorage on items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty?: number) => {
      dispatch({ type: "add", item, qty });
      setLastAdded({ ...item, addedAt: Date.now() });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setLastAdded(null), 3500);
    },
    [],
  );
  const dismissLastAdded = useCallback(() => {
    setLastAdded(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);
  const removeItem = useCallback(
    (variantId: string) => dispatch({ type: "remove", variantId }),
    [],
  );
  const updateQty = useCallback(
    (variantId: string, quantity: number) =>
      dispatch({ type: "update_qty", variantId, quantity }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);
  const toggleCart = useCallback(() => dispatch({ type: "toggle" }), []);
  const closeCart = useCallback(() => dispatch({ type: "close" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        toggleCart,
        closeCart,
        totalItems,
        totalPrice,
        lastAdded,
        dismissLastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ────────────────────────── Hook ────────────────────────── */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
