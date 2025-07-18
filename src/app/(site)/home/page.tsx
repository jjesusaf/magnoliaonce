"use client"
import { HeroCarousel } from "@/components/layouts/hero-carousel"
import { ArrangementsSection } from "@/components/layouts/arrangements-section"
import { Footer } from "@/components/layouts/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50">
     
      <main>
        <HeroCarousel />
        <ArrangementsSection />
        {/* Aquí puedes agregar más secciones como testimonios, blog, etc. */}
      </main>
      <Footer />
    </div>
  )
}
