import Link from "next/link";
import { InfoPageShell } from "@/components/layouts/info-page-shell";
import { Mail, Instagram, MapPin, Clock, MessageCircle } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const es = lang === "es";

  const channels = [
    {
      icon: Mail,
      label: es ? "Correo electrónico" : "Email",
      value: "hola@magnoliaonce.com",
      href: "mailto:hola@magnoliaonce.com",
      description: es
        ? "Para pedidos especiales, facturación y consultas generales."
        : "For special orders, invoicing, and general inquiries.",
    },
    {
      icon: Instagram,
      label: "Instagram",
      value: "@magnoliaonce",
      href: "https://www.instagram.com/magnoliaonce",
      description: es
        ? "Síguenos para ver nuestros arreglos más recientes e inspírate."
        : "Follow us for our latest arrangements and inspiration.",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "+52 81 1234 5678",
      href: "https://wa.me/528112345678",
      description: es
        ? "Respuesta rápida para consultas sobre pedidos y disponibilidad."
        : "Quick response for order inquiries and availability.",
    },
  ];

  return (
    <InfoPageShell lang={lang} current="contact">
      {/* Badge */}
      <span className="inline-block text-[11px] tracking-widest uppercase text-primary/80 font-semibold mb-4">
        {es ? "Hablemos" : "Get in Touch"}
      </span>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold text-base-content leading-tight">
        {es ? "Contacto" : "Contact"}
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-base-content/50 mt-2 mb-10 max-w-md">
        {es
          ? "Estamos aquí para ayudarte. Elige el canal que prefieras y te responderemos lo antes posible."
          : "We're here to help. Choose your preferred channel and we'll get back to you as soon as possible."}
      </p>

      {/* Contact channels */}
      <div className="space-y-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-4 p-5 rounded-xl border border-base-200 hover:border-primary/30 hover:bg-base-200/40 transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs tracking-wider uppercase text-base-content/40 mb-0.5">
                  {ch.label}
                </p>
                <p className="text-sm font-medium text-base-content group-hover:text-primary transition-colors">
                  {ch.value}
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  {ch.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Location & Hours */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {/* Location */}
        <div className="p-5 rounded-xl border border-base-200">
          <div className="flex items-center gap-2.5 mb-3">
            <MapPin className="h-4 w-4 text-primary/60" />
            <h2 className="text-xs tracking-wider uppercase text-base-content/40 font-semibold">
              {es ? "Ubicación" : "Location"}
            </h2>
          </div>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Monterrey, Nuevo León
            <br />
            México
          </p>
        </div>

        {/* Hours */}
        <div className="p-5 rounded-xl border border-base-200">
          <div className="flex items-center gap-2.5 mb-3">
            <Clock className="h-4 w-4 text-primary/60" />
            <h2 className="text-xs tracking-wider uppercase text-base-content/40 font-semibold">
              {es ? "Horario" : "Hours"}
            </h2>
          </div>
          <div className="text-sm text-base-content/70 space-y-1">
            <div className="flex justify-between">
              <span>{es ? "Lun — Vie" : "Mon — Fri"}</span>
              <span className="text-base-content/50">9:00 — 19:00</span>
            </div>
            <div className="flex justify-between">
              <span>{es ? "Sáb" : "Sat"}</span>
              <span className="text-base-content/50">10:00 — 15:00</span>
            </div>
            <div className="flex justify-between">
              <span>{es ? "Dom" : "Sun"}</span>
              <span className="text-base-content/50 italic">
                {es ? "Cerrado" : "Closed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ CTA */}
      <div className="mt-12 text-center py-8 border-t border-base-200">
        <p className="text-sm text-base-content/50 mb-4">
          {es
            ? "¿Tienes preguntas frecuentes? Consulta nuestro FAQ."
            : "Have common questions? Check our FAQ."}
        </p>
        <Link
          href={`/${lang}/faq`}
          className="btn btn-outline btn-sm tracking-wider uppercase"
        >
          {es ? "Ver FAQ" : "View FAQ"}
        </Link>
      </div>
    </InfoPageShell>
  );
}
