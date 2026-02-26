import { InfoPageShell } from "@/components/layouts/info-page-shell";
import {
  CheckCircle,
  ShieldCheck,
  UserCog,
  Tag,
  Truck,
  Ban,
  Scale,
  Mail,
} from "lucide-react";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const es = lang === "es";

  const sections = es
    ? [
        {
          icon: CheckCircle,
          title: "1. Aceptación de los términos",
          body: (
            <p>
              Al acceder y utilizar Magnolia Once, aceptas estar sujeto a estos
              términos de servicio. Si no estás de acuerdo con alguno de estos
              términos, te pedimos que no utilices nuestro sitio.
            </p>
          ),
        },
        {
          icon: ShieldCheck,
          title: "2. Uso del servicio",
          body: (
            <>
              <p>
                Magnolia Once es una plataforma de comercio electrónico
                especializada en arreglos florales. Al usar nuestro servicio te
                comprometes a:
              </p>
              <ul>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la seguridad de tu cuenta</li>
                <li>
                  No usar el servicio para fines ilegales o no autorizados
                </li>
                <li>No interferir con el funcionamiento del sitio</li>
              </ul>
            </>
          ),
        },
        {
          icon: UserCog,
          title: "3. Cuentas de usuario",
          body: (
            <p>
              Para realizar compras, necesitas crear una cuenta a través de
              Google, Apple o Facebook. Eres responsable de toda la actividad que
              ocurra bajo tu cuenta.
            </p>
          ),
        },
        {
          icon: Tag,
          title: "4. Productos y precios",
          body: (
            <p>
              Los precios de nuestros arreglos florales están expresados en pesos
              mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de
              modificar precios sin previo aviso. Las imágenes son de referencia;
              cada arreglo floral es único por naturaleza.
            </p>
          ),
        },
        {
          icon: Truck,
          title: "5. Pedidos y entregas",
          body: (
            <p>
              Al realizar un pedido, recibirás una confirmación por correo
              electrónico. Los tiempos de entrega dependen de la zona y
              disponibilidad. Nos reservamos el derecho de cancelar pedidos en
              caso de fuerza mayor o falta de disponibilidad.
            </p>
          ),
        },
        {
          icon: Ban,
          title: "6. Política de cancelación",
          body: (
            <p>
              Los pedidos pueden cancelarse hasta 24 horas antes de la fecha de
              entrega programada. Debido a la naturaleza perecedera de los
              arreglos florales, no se aceptan devoluciones una vez entregado el
              producto.
            </p>
          ),
        },
        {
          icon: Scale,
          title: "7. Propiedad intelectual",
          body: (
            <p>
              Todo el contenido de Magnolia Once, incluyendo imágenes, textos,
              logotipos y diseños, es propiedad de Magnolia Once y está protegido
              por las leyes de propiedad intelectual.
            </p>
          ),
        },
        {
          icon: Mail,
          title: "8. Contacto",
          body: (
            <p>
              Para cualquier consulta sobre estos términos, contáctanos en{" "}
              <a
                href="mailto:hola@magnoliaonce.com"
                className="text-primary hover:underline font-medium"
              >
                hola@magnoliaonce.com
              </a>
              .
            </p>
          ),
        },
      ]
    : [
        {
          icon: CheckCircle,
          title: "1. Acceptance of Terms",
          body: (
            <p>
              By accessing and using Magnolia Once, you agree to be bound by
              these terms of service. If you do not agree with any of these
              terms, please do not use our site.
            </p>
          ),
        },
        {
          icon: ShieldCheck,
          title: "2. Use of Service",
          body: (
            <>
              <p>
                Magnolia Once is an e-commerce platform specializing in floral
                arrangements. By using our service, you agree to:
              </p>
              <ul>
                <li>Provide truthful and up-to-date information</li>
                <li>Maintain the security of your account</li>
                <li>
                  Not use the service for illegal or unauthorized purposes
                </li>
                <li>Not interfere with the operation of the site</li>
              </ul>
            </>
          ),
        },
        {
          icon: UserCog,
          title: "3. User Accounts",
          body: (
            <p>
              To make purchases, you need to create an account through Google,
              Apple, or Facebook. You are responsible for all activity that
              occurs under your account.
            </p>
          ),
        },
        {
          icon: Tag,
          title: "4. Products and Pricing",
          body: (
            <p>
              Prices for our floral arrangements are expressed in Mexican pesos
              (MXN) and include VAT. We reserve the right to modify prices
              without prior notice. Images are for reference; each floral
              arrangement is unique by nature.
            </p>
          ),
        },
        {
          icon: Truck,
          title: "5. Orders and Delivery",
          body: (
            <p>
              When you place an order, you will receive a confirmation email.
              Delivery times depend on the area and availability. We reserve the
              right to cancel orders in case of force majeure or lack of
              availability.
            </p>
          ),
        },
        {
          icon: Ban,
          title: "6. Cancellation Policy",
          body: (
            <p>
              Orders can be cancelled up to 24 hours before the scheduled
              delivery date. Due to the perishable nature of floral arrangements,
              returns are not accepted once the product has been delivered.
            </p>
          ),
        },
        {
          icon: Scale,
          title: "7. Intellectual Property",
          body: (
            <p>
              All content on Magnolia Once, including images, text, logos, and
              designs, is the property of Magnolia Once and is protected by
              intellectual property laws.
            </p>
          ),
        },
        {
          icon: Mail,
          title: "8. Contact",
          body: (
            <p>
              For any questions about these terms, contact us at{" "}
              <a
                href="mailto:hola@magnoliaonce.com"
                className="text-primary hover:underline font-medium"
              >
                hola@magnoliaonce.com
              </a>
              .
            </p>
          ),
        },
      ];

  return (
    <InfoPageShell lang={lang} current="terms">
      {/* Badge */}
      <span className="inline-block text-[11px] tracking-widest uppercase text-primary/80 font-semibold mb-4">
        {es ? "Información Legal" : "Legal"}
      </span>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold text-base-content leading-tight">
        {es ? "Términos de Servicio" : "Terms of Service"}
      </h1>

      {/* Date */}
      <p className="text-sm text-base-content/40 mt-2 mb-10">
        {es
          ? "Última actualización: 25 de febrero de 2026"
          : "Last updated: February 25, 2026"}
      </p>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="relative pl-6 border-l-2 border-base-300 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <Icon className="h-4 w-4 text-primary/60 shrink-0" />
                <h2 className="text-base font-semibold text-base-content">
                  {section.title}
                </h2>
              </div>
              <div className="text-sm text-base-content/70 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-base-content/60">
                {section.body}
              </div>
            </section>
          );
        })}
      </div>
    </InfoPageShell>
  );
}
