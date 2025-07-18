import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const arrangements = [
  {
    title: "Ramos de Novia",
    description: "Diseños únicos y personalizados para tu día especial.",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    title: "Arreglos para Eventos",
    description: "Centros de mesa y decoración para cualquier celebración.",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    title: "Cajas de Rosas",
    description: "Un regalo de lujo que expresa amor y elegancia.",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    title: "Flores de Temporada",
    description: "La selección más fresca y vibrante de cada estación.",
    image: "/placeholder.svg?height=400&width=400",
  },
]

export function ArrangementsSection() {
  return (
    <section className="py-16 sm:py-24 bg-rose-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Nuestros Arreglos
          </h2>
          <p className="mt-4 text-lg text-emerald-700 max-w-2xl mx-auto">
            Cada arreglo es una obra de arte, creada con pasión y las flores más frescas.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {arrangements.map((item) => (
            <Card
              key={item.title}
              className="overflow-hidden group border-rose-200/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">{item.title}</h3>
                  <p className="text-emerald-600 mb-4">{item.description}</p>
                  <Button variant="link" className="text-rose-600 hover:text-rose-700">
                    Ver más <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
