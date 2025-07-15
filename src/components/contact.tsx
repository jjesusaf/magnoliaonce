"use client"
import { FaInstagram } from 'react-icons/fa';

export default function Contact() {
  // ⚙️ Configura tus datos una sola vez aquí
  const phoneNumber = '5518322693';        // sin espacios
  const waLink = `https://wa.me/52${phoneNumber}`;        // +52 = MX
  const igUser = 'magnoliaonce';           // tu @ en IG (sin @)
  const igAppLink = `instagram://user?username=${igUser}`;
  const igWebLink = `https://instagram.com/${igUser}`;

  // Intentamos abrir la app de IG; si falla en 300 ms → web
  const handleIgClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = igAppLink;
    setTimeout(() => {
      window.open(igWebLink, '_blank', 'noopener,noreferrer');
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
        className="text-black text-[18px] md:text-[24px] font-light hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        TEL: 55 1832 2693
      </a>

      {/* Separador vertical real */}
      <div className="h-6 md:h-8 w-px bg-black" />

      {/* Instagram */}
      <a
        href={igWebLink}
        onClick={handleIgClick}
        aria-label="Visita nuestro Instagram"
        className="flex items-center text-black text-[18px] md:text-[24px] font-light hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        <FaInstagram className="mr-2 md:mr-3 h-[20px] w-[20px] md:h-[24px] md:w-[24px]" />
        IG:&nbsp;@{igUser}.com
      </a>
    </div>
  );
}
