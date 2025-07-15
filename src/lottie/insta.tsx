"use client";
import { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import instaIcon from "@/json/instaicon.json";

export default function InstagramLottie() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <div
      onMouseEnter={() => lottieRef.current?.playSegments([0, 60], true)}
      onMouseLeave={() => lottieRef.current?.goToAndStop(0, true)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={instaIcon}
        loop={false}
        autoplay={false}
        style={{ width: 30, height: 30 }}
      />
    </div>
  );
}
