"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

type Props = {
  productId: string;
  lang: string;
  variant: "card" | "detail";
};

export function FavoriteButton({ productId, lang, variant }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const active = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/${lang}/login`);
      return;
    }

    toggleFavorite(productId);
  };

  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        className={`absolute top-2 right-2 z-10 btn btn-ghost btn-circle btn-sm bg-base-100/70 backdrop-blur-sm shadow-sm transition-all ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label={active ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            active ? "fill-red-500 text-red-500" : "text-base-content/70"
          }`}
        />
      </button>
    );
  }

  // detail variant
  return (
    <button
      onClick={handleClick}
      className="btn btn-ghost btn-circle"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          active ? "fill-red-500 text-red-500" : "text-base-content/70"
        }`}
      />
    </button>
  );
}
