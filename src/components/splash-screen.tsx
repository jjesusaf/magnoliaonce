"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SLIDES = [
  {
    src: "/images/logo.svg",
    alt: "Magnolia Once",
    width: 400,
    height: 56,
    size: "w-[240px] md:w-[380px] lg:w-[440px]",
  },
  {
    src: "/images/logo-mini-dark.svg",
    alt: "M11",
    width: 200,
    height: 140,
    size: "w-[100px] md:w-[150px] lg:w-[180px]",
  },
  {
    src: "/images/logo-light.svg",
    alt: "Magnolia Once",
    width: 400,
    height: 56,
    size: "w-[260px] md:w-[400px] lg:w-[480px]",
  },
  {
    src: "/images/logo-mini-light.svg",
    alt: "M11",
    width: 200,
    height: 140,
    size: "w-[120px] md:w-[160px] lg:w-[200px]",
  },
];

const SLIDE_MS = 600;
const HOLD_MS = 100;

// Slide direction: each logo slides in from the right, exits to the left
const slideVariants = {
  enter: { x: "100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

type Props = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback(() => {
    if (index < SLIDES.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setDone(true);
    }
  }, [index]);

  useEffect(() => {
    const timer = setTimeout(advance, SLIDE_MS + HOLD_MS);
    return () => clearTimeout(timer);
  }, [advance]);

  const progress = ((index + 1) / SLIDES.length) * 100;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] bg-primary overflow-hidden flex items-center justify-center"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Carousel */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            >
              <Image
                src={SLIDES[index].src}
                alt={SLIDES[index].alt}
                width={SLIDES[index].width}
                height={SLIDES[index].height}
                className={`${SLIDES[index].size} h-auto`}
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-content/10">
            <motion.div
              className="h-full bg-primary-content/60"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
