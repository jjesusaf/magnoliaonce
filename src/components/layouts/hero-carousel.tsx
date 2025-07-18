"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";

const heroData = [
  {
    title: "Elegancia que Florece",
    description: "Descubre nuestros ramos de autor, diseñados para cautivar.",
    image: "/assets-site/tulipan1.jpeg",
    buttonText: "Ver Ramos",
  },
  {
    title: "Momentos Inolvidables",
    description:
      "Decoración floral para bodas y eventos que recordarás siempre.",
    image: "/assets-site/arreglo2.jpeg",
    buttonText: "Cotizar Evento",
  },
  {
    title: "Frescura de Temporada",
    description:
      "Las flores más frescas y vibrantes de la estación, directo a tu hogar.",
    image: "/assets-site/arreglo1.jpeg",
    buttonText: "Flores de Temporada",
  },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <section className="w-full pt-16">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {heroData.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[60vh] md:h-[calc(100vh-64px)] w-full">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4 ">
                  <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-4 [text-shadow:0_0_20px_rgba(255,255,255,0.6)] drop-shadow-lg">
                    {item.title}
                  </h1>
                  <p className="text-lg md:text-xl max-w-2xl drop-shadow-md mb-8 [text-shadow:0_0_20px_rgba(255,255,255,0.6)] drop-shadow-lg">
                    {item.description}
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-8 py-6 rounded-full shadow-lg shadow-rose-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 text-lg cursor-pointer"
                  >
                    {item.buttonText}
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-2 z-10"></div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex cursor-pointer" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex cursor-pointer" />
      </Carousel>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {heroData.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              current === index
                ? "w-6 bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
