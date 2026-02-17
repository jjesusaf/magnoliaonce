"use client";

import { useState } from "react";
import { SplashScreen } from "./splash-screen";

const SPLASH_KEY = "magnolia_splash_seen";

type Props = {
  children: React.ReactNode;
};

export function HomeWithSplash({ children }: Props) {
  const [showSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(SPLASH_KEY);
  });

  function handleComplete() {
    localStorage.setItem(SPLASH_KEY, "1");
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleComplete} />}
      {children}
    </>
  );
}
