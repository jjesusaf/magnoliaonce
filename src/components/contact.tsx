"use client";
import { FaInstagram } from "react-icons/fa"; 
import Image from "next/image";
import InstaLottie from "@/lottie/insta";

export default function Contact() {
  /* ⚙️  CONFIG */
  const phoneNumber = "5518322693";     // sin espacios
  const waMessage = encodeURIComponent(
    "¡Hola! Vengo de la web y quiero más información sobre Magnolia Once."
  );
  const waLink = `https://wa.me/52${phoneNumber}?text=${waMessage}`;

  const igUser = "magnoliaonce";
  const igAppLink = `instagram://user?username=${igUser}`;
  const igWebLink = `https://instagram.com/${igUser}`;

  /* Deep‑link a la app de IG con fallback web */
  const handleIgClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = igAppLink;
    setTimeout(() => {
      window.open(igWebLink, "_blank", "noopener,noreferrer");
    }, 300);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* WhatsApp */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        className="text-black text-[18px] md:text-[24px] font-thin hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        TEL: 55 1832 2693
      </a>

      {/* Separador */}
      <div className="h-6 md:h-8 w-px bg-black" />

      {/* Instagram */}
      <a
        href={igWebLink}
        onClick={handleIgClick}
        aria-label="Visita nuestro Instagram"
        className="flex items-center text-black text-[18px] md:text-[24px] font-thin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        <InstaLottie />
        IG:&nbsp;@{igUser}.com
      </a>
    </div>
  );
}
