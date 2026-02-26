"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

type FavoritesContextValue = {
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  loading: boolean;
  count: number;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  isFavorite: () => false,
  toggleFavorite: () => {},
  loading: true,
  count: 0,
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          setIds(new Set(data.map((r) => r.product_id)));
        }
        setLoading(false);
      });
  }, [user]);

  const isFavorite = useCallback(
    (productId: string) => ids.has(productId),
    [ids],
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      if (!user) return;

      const wasActive = ids.has(productId);
      // Optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (wasActive) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      const supabase = createClient();

      if (wasActive) {
        supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .then(({ error }) => {
            if (error) {
              // Revert
              setIds((prev) => new Set(prev).add(productId));
            }
          });
      } else {
        supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId })
          .then(({ error }) => {
            if (error) {
              // Revert
              setIds((prev) => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
              });
            }
          });
      }
    },
    [user, ids],
  );

  return (
    <FavoritesContext.Provider
      value={{ isFavorite, toggleFavorite, loading, count: ids.size }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
