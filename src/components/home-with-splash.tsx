"use client";

import { useState } from "react";
import { SplashScreen } from "./splash-screen";

type Props = {
  children: React.ReactNode;
};

export function HomeWithSplash({ children }: Props) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {children}
    </>
  );
}
