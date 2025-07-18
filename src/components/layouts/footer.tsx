import {  Instagram, Facebook, PinIcon as Pinterest } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white">
            <Image src="/images/logo.svg" alt="magnoliaonce" width={100} height={100}  />
            </Link>
            <p className="text-rose-200">Creando momentos inolvidables con la belleza de las flores desde 2010.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                <Instagram />
              </Link>
              <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                <Facebook />
              </Link>
              <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                <Pinterest />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Flores
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Ramos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Cuidado de las Flores
                </Link>
              </li>
              <li>
                <Link href="#" className="text-rose-200 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-2 text-rose-200">
              <li>Av. Siempreviva 123, Springfield</li>
              <li>hola@bellaflora.com</li>
              <li>+52 55 1234 5678</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-emerald-700 pt-8 text-center text-rose-300">
          <p>&copy; {new Date().getFullYear()} Bella Flora. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
