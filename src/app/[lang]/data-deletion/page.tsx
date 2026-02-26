import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trash2, Mail, Clock, CheckCircle } from "lucide-react";

export default async function DataDeletionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const es = lang === "es";

  const steps = es
    ? [
        {
          icon: "1",
          title: "Envía tu solicitud",
          description:
            "Envía un correo electrónico a hola@magnoliaonce.com con el asunto \"Eliminar mis datos\" desde la dirección de correo asociada a tu cuenta.",
        },
        {
          icon: "2",
          title: "Verificación de identidad",
          description:
            "Verificaremos que la solicitud proviene del titular de la cuenta. Podemos solicitar información adicional para confirmar tu identidad.",
        },
        {
          icon: "3",
          title: "Procesamiento",
          description:
            "Procesaremos tu solicitud dentro de un plazo máximo de 30 días hábiles. Recibirás una confirmación por correo electrónico una vez completada la eliminación.",
        },
        {
          icon: "4",
          title: "Confirmación",
          description:
            "Todos los datos personales asociados a tu cuenta serán eliminados de forma permanente de nuestros sistemas, incluyendo nombre, correo electrónico y foto de perfil.",
        },
      ]
    : [
        {
          icon: "1",
          title: "Submit your request",
          description:
            'Send an email to hola@magnoliaonce.com with the subject "Delete my data" from the email address associated with your account.',
        },
        {
          icon: "2",
          title: "Identity verification",
          description:
            "We will verify that the request comes from the account holder. We may request additional information to confirm your identity.",
        },
        {
          icon: "3",
          title: "Processing",
          description:
            "We will process your request within a maximum of 30 business days. You will receive a confirmation email once the deletion is complete.",
        },
        {
          icon: "4",
          title: "Confirmation",
          description:
            "All personal data associated with your account will be permanently deleted from our systems, including name, email address, and profile picture.",
        },
      ];

  return (
    <div className="min-h-dvh bg-base-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-200">
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-6 py-3">
          <Link
            href={`/${lang}/shop`}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={es ? "Volver" : "Back"}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="logo-stack grid">
            <Image
              src="/images/logo.svg"
              alt="Magnolia Once"
              width={120}
              height={24}
              className="logo-dark h-5 w-auto"
            />
            <Image
              src="/images/logo-light.svg"
              alt="Magnolia Once"
              width={120}
              height={24}
              className="logo-light h-5 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-error/10">
            <Trash2 className="h-5 w-5 text-error/70" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-base-content leading-tight">
              {es ? "Eliminación de Datos" : "Data Deletion"}
            </h1>
          </div>
        </div>

        <p className="text-sm text-base-content/50 mb-10 max-w-md">
          {es
            ? "Si deseas eliminar tu cuenta y todos los datos personales asociados, sigue estos pasos:"
            : "If you wish to delete your account and all associated personal data, follow these steps:"}
        </p>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-base-200 text-base-content/60 text-sm font-semibold shrink-0">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-base-300 mt-2" />
                )}
              </div>
              <div className="pb-6">
                <h2 className="text-sm font-semibold text-base-content mb-1">
                  {step.title}
                </h2>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="p-4 rounded-xl border border-base-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary/60" />
              <span className="text-xs tracking-wider uppercase text-base-content/40 font-semibold">
                {es ? "Correo de contacto" : "Contact email"}
              </span>
            </div>
            <a
              href="mailto:hola@magnoliaonce.com"
              className="text-sm text-primary hover:underline font-medium"
            >
              hola@magnoliaonce.com
            </a>
          </div>

          <div className="p-4 rounded-xl border border-base-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary/60" />
              <span className="text-xs tracking-wider uppercase text-base-content/40 font-semibold">
                {es ? "Tiempo de respuesta" : "Response time"}
              </span>
            </div>
            <p className="text-sm text-base-content/70">
              {es ? "Máximo 30 días hábiles" : "Up to 30 business days"}
            </p>
          </div>
        </div>

        {/* What gets deleted */}
        <div className="mt-8 p-5 rounded-xl border border-base-200 bg-base-200/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-success/70" />
            <h3 className="text-xs tracking-wider uppercase text-base-content/40 font-semibold">
              {es ? "Datos que se eliminan" : "Data that gets deleted"}
            </h3>
          </div>
          <ul className="text-sm text-base-content/60 space-y-1.5 list-disc pl-5">
            <li>{es ? "Nombre completo" : "Full name"}</li>
            <li>{es ? "Dirección de correo electrónico" : "Email address"}</li>
            <li>{es ? "Foto de perfil" : "Profile picture"}</li>
            <li>{es ? "Historial de pedidos" : "Order history"}</li>
            <li>
              {es
                ? "Cualquier dato de sesión almacenado"
                : "Any stored session data"}
            </li>
          </ul>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-base-200 mt-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-base-content/30">© 2026 Magnolia Once</p>
          <Link
            href={`/${lang}/privacy`}
            className="text-xs text-base-content/40 hover:text-base-content/60 transition-colors"
          >
            {es ? "Política de Privacidad" : "Privacy Policy"}
          </Link>
        </div>
      </footer>
    </div>
  );
}
