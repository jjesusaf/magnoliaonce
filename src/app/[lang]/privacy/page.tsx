import { InfoPageShell } from "@/components/layouts/info-page-shell";
import { ShieldCheck, Database, Cookie, UserCheck, Mail } from "lucide-react";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const es = lang === "es";

  const sections = es
    ? [
        {
          icon: ShieldCheck,
          title: "1. Información que recopilamos",
          body: (
            <>
              <p>
                Cuando inicias sesión a través de Google, Apple o Facebook,
                recopilamos la siguiente información proporcionada por el
                proveedor de autenticación:
              </p>
              <ul>
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Foto de perfil (si está disponible)</li>
              </ul>
            </>
          ),
        },
        {
          icon: Database,
          title: "2. Cómo usamos tu información",
          body: (
            <>
              <p>Utilizamos tu información para:</p>
              <ul>
                <li>Crear y gestionar tu cuenta</li>
                <li>Procesar tus pedidos y transacciones</li>
                <li>Personalizar tu experiencia de compra</li>
                <li>Comunicarnos contigo sobre tus pedidos</li>
              </ul>
            </>
          ),
        },
        {
          icon: Database,
          title: "3. Almacenamiento de datos",
          body: (
            <p>
              Tus datos se almacenan de forma segura en servidores protegidos
              proporcionados por Supabase. No vendemos, intercambiamos ni
              transferimos tu información personal a terceros.
            </p>
          ),
        },
        {
          icon: Cookie,
          title: "4. Cookies",
          body: (
            <p>
              Utilizamos cookies esenciales para mantener tu sesión activa y
              garantizar el funcionamiento correcto de la plataforma. No
              utilizamos cookies de rastreo publicitario.
            </p>
          ),
        },
        {
          icon: UserCheck,
          title: "5. Tus derechos",
          body: (
            <>
              <p>Tienes derecho a:</p>
              <ul>
                <li>Acceder a tus datos personales</li>
                <li>Solicitar la corrección de tus datos</li>
                <li>Solicitar la eliminación de tu cuenta y datos</li>
                <li>Retirar tu consentimiento en cualquier momento</li>
              </ul>
            </>
          ),
        },
        {
          icon: Mail,
          title: "6. Contacto",
          body: (
            <p>
              Si tienes preguntas sobre esta política de privacidad, contáctanos
              en{" "}
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
          icon: ShieldCheck,
          title: "1. Information We Collect",
          body: (
            <>
              <p>
                When you sign in through Google, Apple, or Facebook, we collect
                the following information provided by the authentication
                provider:
              </p>
              <ul>
                <li>Full name</li>
                <li>Email address</li>
                <li>Profile picture (if available)</li>
              </ul>
            </>
          ),
        },
        {
          icon: Database,
          title: "2. How We Use Your Information",
          body: (
            <>
              <p>We use your information to:</p>
              <ul>
                <li>Create and manage your account</li>
                <li>Process your orders and transactions</li>
                <li>Personalize your shopping experience</li>
                <li>Communicate with you about your orders</li>
              </ul>
            </>
          ),
        },
        {
          icon: Database,
          title: "3. Data Storage",
          body: (
            <p>
              Your data is securely stored on protected servers provided by
              Supabase. We do not sell, trade, or transfer your personal
              information to third parties.
            </p>
          ),
        },
        {
          icon: Cookie,
          title: "4. Cookies",
          body: (
            <p>
              We use essential cookies to keep your session active and ensure the
              platform functions correctly. We do not use advertising tracking
              cookies.
            </p>
          ),
        },
        {
          icon: UserCheck,
          title: "5. Your Rights",
          body: (
            <>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw your consent at any time</li>
              </ul>
            </>
          ),
        },
        {
          icon: Mail,
          title: "6. Contact",
          body: (
            <p>
              If you have questions about this privacy policy, contact us at{" "}
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
    <InfoPageShell lang={lang} current="privacy">
      {/* Badge */}
      <span className="inline-block text-[11px] tracking-widest uppercase text-primary/80 font-semibold mb-4">
        {es ? "Información Legal" : "Legal"}
      </span>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold text-base-content leading-tight">
        {es ? "Política de Privacidad" : "Privacy Policy"}
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
