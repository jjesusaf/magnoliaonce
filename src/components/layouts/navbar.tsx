"use client";

import * as React from "react";
import {
  Menu,
  X,
  Search,
  Heart,
  User,
  ChevronDown,
  ShoppingBag,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function FloristNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const items = [
    { key: 1, name: "Inicio", href: "/home" },
    { key: 2, name: "Flores", href: "#" },
    { key: 3, name: "Ramos", href: "#" },
    { key: 4, name: "Eventos", href: "#" },
    { key: 5, name: "Plantas", href: "#" },
    { key: 6, name: "Contacto", href: "/contact" },
  ];
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-rose-100/50 shadow-lg shadow-rose-900/5"
          : "bg-white/85 backdrop-blur-sm border-b border-rose-100/30"
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}

          <div className="flex items-center space-x-2 shrink-0">
            <Image
              src="/images/logo.svg"
              alt="magnoliaonce"
              width={100}
              height={100}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {items.map((item) => (
              <Link href={item.href} key={item.key}>
                <Button
                  variant="ghost"
                  className="relative px-4 py-2 text-emerald-700 hover:text-rose-600 transition-all duration-200 hover:bg-rose-50/50 rounded-lg group cursor-pointer"
                >
                  {item.name}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-linear-to-r from-rose-400 to-pink-500 transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
                </Button>
              </Link>
            ))}
          </div>

          {/* Search Bar - Hidden on small screens */}
          <div className="hidden xl:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <Input
                placeholder="Buscar flores..."
                className="pl-10 pr-4 py-2 w-full bg-rose-50/50 border-rose-200/50 focus:bg-white focus:border-rose-300 transition-all duration-200 rounded-xl placeholder:text-emerald-500"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Icon for smaller screens */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden hover:bg-rose-50/50 rounded-xl"
            >
              <Search className="w-5 h-5 text-emerald-600" />
            </Button>

            {/* Phone */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-rose-50/50 rounded-xl hidden sm:flex"
            >
              <Phone className="w-5 h-5 text-emerald-600" />
            </Button>

            {/* Favorites/Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-rose-50/50 rounded-xl hidden sm:flex"
            >
              <Heart className="w-5 h-5 text-rose-500" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-linear-to-r from-rose-400 to-pink-500 text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-rose-50/50 rounded-xl"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-linear-to-r from-emerald-400 to-green-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-rose-50/50 rounded-xl px-2 sm:px-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-emerald-600 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white/95 backdrop-blur-xl border-rose-200/50"
              >
                <DropdownMenuLabel className="text-emerald-700">
                  Mi Cuenta
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                <DropdownMenuItem>Mis Pedidos</DropdownMenuItem>
                <DropdownMenuItem>Lista de Deseos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Button */}
            <Button className="hidden md:flex bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-4 lg:px-6 py-2 rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-105 text-sm">
              Pedir Ahora
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-rose-50/50 rounded-xl"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-5 h-5 text-emerald-600" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-600" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-rose-200/50">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Search */}
            <div className="relative xl:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <Input
                placeholder="Buscar flores..."
                className="pl-10 pr-4 py-2 w-full bg-rose-50/50 border-rose-200/50 rounded-xl placeholder:text-emerald-500"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-1">
              {[
                "Inicio",
                "Flores",
                "Ramos",
                "Eventos",
                "Plantas",
                "Contacto",
              ].map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  className="w-full justify-start text-emerald-700 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl py-3"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </Button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="space-y-1 sm:hidden">
              <Button
                variant="ghost"
                className="w-full justify-start text-emerald-700 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl py-3"
              >
                <Phone className="w-4 h-4 mr-3" />
                Llamar
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start text-emerald-700 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl py-3"
              >
                <Heart className="w-4 h-4 mr-3" />
                Favoritos
                <Badge className="ml-auto bg-linear-to-r from-rose-400 to-pink-500 text-white">
                  2
                </Badge>
              </Button>
            </div>

            {/* Mobile CTA */}
            <Button
              className="w-full bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-rose-500/25 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              Pedir Ahora
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
