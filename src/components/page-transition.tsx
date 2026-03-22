"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  children: React.ReactNode;
};

export function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(false);

  const triggerEntrance = useCallback(() => {
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsEntering(false);
      });
    });
  }, []);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      triggerEntrance();
    }
  }, [pathname, triggerEntrance]);

  return (
    <div
      ref={containerRef}
      className={isEntering ? "page-enter" : "page-enter-active"}
    >
      {children}
    </div>
  );
}
