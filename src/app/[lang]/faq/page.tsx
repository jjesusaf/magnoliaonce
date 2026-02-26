import Link from "next/link";
import { InfoPageShell } from "@/components/layouts/info-page-shell";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const es = lang === "es";

  const faqs = es
    ? [
        {
          category: "Pedidos",
          items: [
            {
              q: "¿Cómo realizo un pedido?",
              a: "Navega nuestra tienda, selecciona el arreglo que más te guste, elige la variante si está disponible y agrégalo al carrito. Cuando estés listo, procede al pago con tu cuenta.",
            },
            {
              q: "¿Con cuánta anticipación debo ordenar?",
              a: "Recomendamos ordenar con al menos 48 horas de anticipación para garantizar disponibilidad. Para eventos especiales como bodas o corporativos, sugerimos contactarnos con 2 a 4 semanas de anticipación.",
            },
            {
              q: "¿Puedo personalizar mi arreglo?",
              a: "Cada arreglo es único por naturaleza. Si tienes preferencias de color o flores específicas, contáctanos por correo o Instagram y haremos lo posible por adaptarnos a tu visión.",
            },
          ],
        },
        {
          category: "Entregas",
          items: [
            {
              q: "¿Cuáles son las zonas de entrega?",
              a: "Realizamos entregas en la zona metropolitana de Monterrey. Para entregas fuera de esta área, contáctanos para verificar disponibilidad y costos adicionales.",
            },
            {
              q: "¿Cuánto tarda la entrega?",
              a: "Las entregas se realizan en un rango de 2 a 4 horas dentro del horario seleccionado. Te notificaremos por correo electrónico cuando tu pedido esté en camino.",
            },
            {
              q: "¿Puedo programar una entrega para una fecha específica?",
              a: "Sí, durante el proceso de pago podrás seleccionar la fecha y horario de entrega que prefieras, sujeto a disponibilidad.",
            },
          ],
        },
        {
          category: "Pagos y cancelaciones",
          items: [
            {
              q: "¿Qué métodos de pago aceptan?",
              a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de nuestra plataforma de pago segura.",
            },
            {
              q: "¿Puedo cancelar mi pedido?",
              a: "Puedes cancelar tu pedido hasta 24 horas antes de la fecha de entrega programada. Debido a la naturaleza perecedera de las flores, no aceptamos devoluciones una vez entregado el producto.",
            },
            {
              q: "¿Emiten factura?",
              a: "Sí, podemos emitir factura fiscal. Solicita tu factura enviando tus datos fiscales a hola@magnoliaonce.com dentro de las 72 horas posteriores a tu compra.",
            },
          ],
        },
        {
          category: "Cuidado de tus flores",
          items: [
            {
              q: "¿Cómo cuido mi arreglo para que dure más?",
              a: "Mantén tu arreglo en un lugar fresco, alejado de la luz solar directa y fuentes de calor. Cambia el agua cada 2 días y recorta los tallos en diagonal. Evita colocarlo cerca de frutas, ya que el etileno acelera el marchitamiento.",
            },
            {
              q: "¿Cuánto duran los arreglos?",
              a: "Con el cuidado adecuado, nuestros arreglos pueden durar entre 5 y 10 días dependiendo del tipo de flores. Cada arreglo incluye una tarjeta con instrucciones de cuidado.",
            },
          ],
        },
      ]
    : [
        {
          category: "Orders",
          items: [
            {
              q: "How do I place an order?",
              a: "Browse our shop, select the arrangement you like, choose a variant if available, and add it to your cart. When you're ready, proceed to checkout with your account.",
            },
            {
              q: "How far in advance should I order?",
              a: "We recommend ordering at least 48 hours in advance to ensure availability. For special events like weddings or corporate functions, we suggest reaching out 2 to 4 weeks ahead.",
            },
            {
              q: "Can I customize my arrangement?",
              a: "Each arrangement is unique by nature. If you have specific color or flower preferences, contact us via email or Instagram and we'll do our best to accommodate your vision.",
            },
          ],
        },
        {
          category: "Delivery",
          items: [
            {
              q: "What are your delivery areas?",
              a: "We deliver within the Monterrey metropolitan area. For deliveries outside this zone, contact us to check availability and additional costs.",
            },
            {
              q: "How long does delivery take?",
              a: "Deliveries are made within a 2 to 4 hour window during the selected time slot. You'll be notified by email when your order is on its way.",
            },
            {
              q: "Can I schedule a delivery for a specific date?",
              a: "Yes, during checkout you can select your preferred delivery date and time slot, subject to availability.",
            },
          ],
        },
        {
          category: "Payments & Cancellations",
          items: [
            {
              q: "What payment methods do you accept?",
              a: "We accept credit and debit cards (Visa, Mastercard, American Express) through our secure payment platform.",
            },
            {
              q: "Can I cancel my order?",
              a: "You can cancel your order up to 24 hours before the scheduled delivery date. Due to the perishable nature of flowers, we do not accept returns once the product has been delivered.",
            },
            {
              q: "Do you issue invoices?",
              a: "Yes, we can issue a tax invoice. Request yours by sending your tax details to hola@magnoliaonce.com within 72 hours of your purchase.",
            },
          ],
        },
        {
          category: "Flower Care",
          items: [
            {
              q: "How do I care for my arrangement to make it last longer?",
              a: "Keep your arrangement in a cool place, away from direct sunlight and heat sources. Change the water every 2 days and trim the stems at an angle. Avoid placing it near fruit, as ethylene accelerates wilting.",
            },
            {
              q: "How long do arrangements last?",
              a: "With proper care, our arrangements can last between 5 and 10 days depending on the type of flowers. Each arrangement includes a care instruction card.",
            },
          ],
        },
      ];

  return (
    <InfoPageShell lang={lang} current="faq">
      {/* Title */}
      <p className="text-xs tracking-widest uppercase text-base-content/40 mb-3">
        {es ? "Ayuda" : "Help"}
      </p>
      <h1 className="text-2xl md:text-3xl tracking-widest uppercase leading-tight">
        {es ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-base-content/50 mt-3 mb-10 max-w-md leading-relaxed">
        {es
          ? "Encuentra respuestas a las preguntas más comunes sobre nuestros servicios."
          : "Find answers to the most common questions about our services."}
      </p>

      {/* FAQ groups */}
      <div className="space-y-10">
        {faqs.map((group) => (
          <div key={group.category}>
            <h2 className="text-xs tracking-widest uppercase text-base-content/40 mb-4 pl-1">
              {group.category}
            </h2>
            <div className="divide-y divide-base-content/10 border-y border-base-content/10">
              {group.items.map((item, i) => (
                <details key={i} className="group" open={i === 0}>
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-1 text-sm text-base-content hover:text-base-content/70 transition-colors">
                    {item.q}
                    <span className="ml-4 shrink-0 text-base-content/30 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <div className="pb-4 px-1 text-sm text-base-content/60 leading-relaxed">
                    <p>{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center py-8 border-t border-base-content/10">
        <p className="text-sm text-base-content/50 mb-4">
          {es
            ? "¿No encontraste lo que buscabas?"
            : "Didn't find what you were looking for?"}
        </p>
        <Link
          href={`/${lang}/contact`}
          className="inline-block px-6 py-2.5 text-xs tracking-widest uppercase bg-base-content text-base-100 hover:bg-base-content/90 transition-colors"
        >
          {es ? "Contáctanos" : "Contact Us"}
        </Link>
      </div>
    </InfoPageShell>
  );
}
